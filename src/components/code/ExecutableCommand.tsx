/**
 * Editable and executable command component
 */

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommandResult } from "@/components/code/CommandResult";
import { cn } from "@/lib/utils";
import type {
  CommandResult as CommandResultType,
  ExecutableCommand as ExecutableCommandType,
} from "@/types/presentation";
import { Play, RotateCcw, Copy, Check, ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";

interface ExecutableCommandProps {
  /** The command configuration */
  command: ExecutableCommandType;
  /** Execution result if available */
  result?: CommandResultType;
  /** Whether the command is currently executing */
  isExecuting?: boolean;
  /** Pre-loaded file data for file upload commands */
  fileData?: { json?: string | null; csv?: string | null };
  /** Callback when execute is clicked */
  onExecute: (
    command: ExecutableCommandType,
    modifiedEndpoint: string,
    modifiedBody?: string
  ) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Interactive command panel with editable endpoint and body.
 * Shows the command editor on the left and results on the right.
 */
export function ExecutableCommand({
  command,
  result,
  isExecuting = false,
  fileData,
  onExecute,
  className,
}: ExecutableCommandProps) {
  const [editedEndpoint, setEditedEndpoint] = useState(command.endpoint);
  const [editedBody, setEditedBody] = useState(
    typeof command.body === "string"
      ? command.body
      : command.body
        ? JSON.stringify(command.body, null, 2)
        : ""
  );
  const [copied, setCopied] = useState(false);
  const [showCurl, setShowCurl] = useState(false);

  const handleExecute = useCallback(() => {
    // For file upload commands, we pass the file data
    let bodyToSend: string | undefined;
    if (command.requiresFileData) {
      bodyToSend =
        command.requiresFileData === "json" ? fileData?.json ?? undefined : fileData?.csv ?? undefined;
    } else if (editedBody) {
      bodyToSend = editedBody;
    }

    onExecute(
      { ...command, endpoint: editedEndpoint },
      editedEndpoint,
      bodyToSend
    );
  }, [command, editedEndpoint, editedBody, fileData, onExecute]);

  const handleReset = useCallback(() => {
    setEditedEndpoint(command.endpoint);
    setEditedBody(
      typeof command.body === "string"
        ? command.body
        : command.body
          ? JSON.stringify(command.body, null, 2)
          : ""
    );
  }, [command]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(command.curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command.curlCommand]);

  // Determine if endpoint was modified
  const isModified =
    editedEndpoint !== command.endpoint ||
    editedBody !==
      (typeof command.body === "string"
        ? command.body
        : command.body
          ? JSON.stringify(command.body, null, 2)
          : "");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-zinc-100">
            {command.label}
          </h4>
          <p className="text-sm text-zinc-400 mt-1">{command.description}</p>
        </div>
        <span
          className={cn(
            "shrink-0 text-xs font-mono font-semibold px-2.5 py-1 rounded",
            command.method === "GET" && "bg-emerald-900/50 text-emerald-400",
            command.method === "POST" && "bg-blue-900/50 text-blue-400",
            command.method === "PUT" && "bg-amber-900/50 text-amber-400",
            command.method === "PATCH" && "bg-orange-900/50 text-orange-400",
            command.method === "DELETE" && "bg-red-900/50 text-red-400"
          )}
        >
          {command.method}
        </span>
      </div>

      {/* Command editor and result grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor panel */}
        <div className="rounded-lg bg-zinc-900 p-4 space-y-4">
          {/* Endpoint input */}
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
              Endpoint
            </label>
            <input
              type="text"
              value={editedEndpoint}
              onChange={(e) => setEditedEndpoint(e.target.value)}
              className={cn(
                "w-full font-mono text-sm p-2.5 rounded-md",
                "bg-zinc-800 border border-zinc-700",
                "text-zinc-200 placeholder:text-zinc-500",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              )}
            />
          </div>

          {/* Body editor (if applicable) */}
          {!command.requiresFileData && command.body && (
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                Request Body
              </label>
              <Textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className={cn(
                  "font-mono text-sm min-h-[120px]",
                  "bg-zinc-800 border-zinc-700 text-zinc-200"
                )}
              />
            </div>
          )}

          {/* File data indicator */}
          {command.requiresFileData && (
            <div className="text-sm bg-amber-900/20 border border-amber-800/50 rounded-md p-3">
              <span className="text-amber-400">
                This command uses pre-loaded{" "}
                <code className="bg-amber-900/50 px-1 rounded">
                  {command.requiresFileData === "json"
                    ? "transactions.json"
                    : "transactions.csv"}
                </code>{" "}
                data
              </span>
              {fileData && (
                <span className="text-amber-500/70 text-xs block mt-1">
                  {command.requiresFileData === "json" && fileData.json
                    ? `(${(fileData.json.length / 1024).toFixed(1)} KB)`
                    : command.requiresFileData === "csv" && fileData.csv
                      ? `(${(fileData.csv.length / 1024).toFixed(1)} KB)`
                      : "(not loaded)"}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleExecute}
              disabled={isExecuting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-1.5" />
              {isExecuting ? "Executing..." : "Execute"}
            </Button>
            {isModified && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleCopy}
              className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Collapsible curl command */}
          <div className="border-t border-zinc-800 pt-3">
            <button
              onClick={() => setShowCurl(!showCurl)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showCurl && "rotate-180"
                )}
              />
              {showCurl ? "Hide" : "Show"} curl command
            </button>
            {showCurl && (
              <pre className="mt-2 p-3 bg-zinc-950 rounded-md overflow-x-auto text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                {command.curlCommand}
              </pre>
            )}
          </div>
        </div>

        {/* Result panel */}
        <CommandResult result={result} isExecuting={isExecuting} />
      </div>
    </div>
  );
}
