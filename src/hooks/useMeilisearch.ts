/**
 * React hook for Meilisearch API interactions
 */

import { useCallback, useEffect, useState } from "react";
import {
  checkMeilisearchConnection,
  executeMeilisearchRequest,
} from "@/lib/meilisearch-api";
import type { CommandResult, ExecutableCommand } from "@/types/presentation";

interface UseMeilisearchReturn {
  /** Whether connected to Meilisearch */
  isConnected: boolean;
  /** Whether currently checking connection */
  isChecking: boolean;
  /** Map of command ID to execution result */
  results: Map<string, CommandResult>;
  /** Currently executing command IDs */
  executingCommands: Set<string>;
  /** Execute a command and store result */
  executeCommand: (
    command: ExecutableCommand,
    fileData?: string
  ) => Promise<void>;
  /** Clear result for a specific command */
  clearResult: (commandId: string) => void;
  /** Clear all results */
  clearAllResults: () => void;
  /** Manually trigger a connection check */
  checkConnection: () => Promise<void>;
}

/** Connection check interval in milliseconds */
const CONNECTION_CHECK_INTERVAL = 10000;

/**
 * React hook for executing Meilisearch commands and tracking results.
 *
 * @example
 * ```tsx
 * const { isConnected, executeCommand, results } = useMeilisearch();
 *
 * const handleExecute = async () => {
 *   await executeCommand({
 *     id: 'search-1',
 *     method: 'GET',
 *     endpoint: '/indexes/movies/search?q=batman',
 *     // ...
 *   });
 * };
 *
 * const result = results.get('search-1');
 * ```
 */
export function useMeilisearch(): UseMeilisearchReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [results, setResults] = useState<Map<string, CommandResult>>(new Map());
  const [executingCommands, setExecutingCommands] = useState<Set<string>>(
    new Set()
  );

  const checkConnectionInternal = useCallback(async () => {
    setIsChecking(true);
    const connected = await checkMeilisearchConnection();
    setIsConnected(connected);
    setIsChecking(false);
  }, []);

  // Check connection on mount and periodically
  useEffect(() => {
    checkConnectionInternal();
    const interval = setInterval(
      checkConnectionInternal,
      CONNECTION_CHECK_INTERVAL
    );
    return () => clearInterval(interval);
  }, [checkConnectionInternal]);

  const executeCommand = useCallback(
    async (command: ExecutableCommand, fileData?: string): Promise<void> => {
      // Mark command as executing
      setExecutingCommands((prev) => new Set(prev).add(command.id));

      try {
        // Determine the request body
        let body: string | undefined;
        if (command.requiresFileData && fileData) {
          body = fileData;
        } else if (typeof command.body === "string") {
          body = command.body;
        } else if (command.body) {
          body = JSON.stringify(command.body);
        }

        // Execute the request
        const response = await executeMeilisearchRequest({
          method: command.method,
          endpoint: command.endpoint,
          headers: command.headers,
          body,
        });

        // Create result object
        const result: CommandResult = {
          commandId: command.id,
          success: response.success,
          data: response.data,
          error: response.error,
          status: response.status,
          processingTimeMs: response.processingTimeMs,
          executedAt: new Date(),
        };

        // Store result
        setResults((prev) => new Map(prev).set(command.id, result));
      } finally {
        // Remove from executing set
        setExecutingCommands((prev) => {
          const next = new Set(prev);
          next.delete(command.id);
          return next;
        });
      }
    },
    []
  );

  const clearResult = useCallback((commandId: string): void => {
    setResults((prev) => {
      const next = new Map(prev);
      next.delete(commandId);
      return next;
    });
  }, []);

  const clearAllResults = useCallback((): void => {
    setResults(new Map());
  }, []);

  return {
    isConnected,
    isChecking,
    results,
    executingCommands,
    executeCommand,
    clearResult,
    clearAllResults,
    checkConnection: checkConnectionInternal,
  };
}
