/**
 * React hook to load pre-loaded transaction data from the server
 */

import { useEffect, useState } from "react";
import type { FileData } from "@/types/presentation";

/**
 * React hook to fetch pre-loaded transaction data from the server.
 * The data is loaded once on mount and cached.
 *
 * @example
 * ```tsx
 * const { json, csv, isLoading, error } = useFileData();
 *
 * if (isLoading) return <div>Loading data...</div>;
 * if (error) return <div>Error: {error}</div>;
 *
 * // Use json or csv data for API requests
 * ```
 */
export function useFileData(): FileData {
  const [data, setData] = useState<FileData>({
    json: null,
    csv: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function loadData(): Promise<void> {
      try {
        // Fetch both files in parallel
        const [jsonRes, csvRes] = await Promise.all([
          fetch("/api/data/transactions.json"),
          fetch("/api/data/transactions.csv"),
        ]);

        if (!mounted) return;

        let json: string | null = null;
        let csv: string | null = null;
        const errors: string[] = [];

        // Process JSON response
        if (jsonRes.ok) {
          json = await jsonRes.text();
        } else {
          errors.push(`JSON: ${jsonRes.status} ${jsonRes.statusText}`);
        }

        // Process CSV response
        if (csvRes.ok) {
          csv = await csvRes.text();
        } else {
          errors.push(`CSV: ${csvRes.status} ${csvRes.statusText}`);
        }

        if (mounted) {
          setData({
            json,
            csv,
            isLoading: false,
            error: errors.length > 0 ? errors.join("; ") : null,
          });
        }
      } catch (error) {
        if (mounted) {
          setData({
            json: null,
            csv: null,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load transaction data",
          });
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return data;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
