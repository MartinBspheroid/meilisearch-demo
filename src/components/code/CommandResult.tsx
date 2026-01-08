/**
 * Component to display command execution results
 */

import { useShiki } from "@/hooks/useShiki";
import { cn } from "@/lib/utils";
import type { CommandResult as CommandResultType } from "@/types/presentation";

interface CommandResultProps {
  /** The execution result to display */
  result: CommandResultType | undefined;
  /** Whether the command is currently executing */
  isExecuting?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Display panel for command execution results.
 * Shows JSON response with syntax highlighting, timing, and status.
 */
export function CommandResult({
  result,
  isExecuting = false,
  className,
}: CommandResultProps) {
  const { highlight, isLoading: shikiLoading } = useShiki();

  // Loading/executing state
  if (isExecuting) {
    return (
      <div
        className={cn(
          "rounded-lg bg-zinc-900 p-4 min-h-[200px]",
          "flex items-center justify-center",
          className
        )}
      >
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
          <span>Executing...</span>
        </div>
      </div>
    );
  }

  // Empty state - no result yet
  if (!result) {
    return (
      <div
        className={cn(
          "rounded-lg bg-zinc-900/50 p-4 min-h-[200px]",
          "flex items-center justify-center",
          "border-2 border-dashed border-zinc-700",
          className
        )}
      >
        <span className="text-zinc-500 text-sm">
          Execute the command to see results
        </span>
      </div>
    );
  }

  // Format the response data
  const responseText = result.error
    ? JSON.stringify({ error: result.error }, null, 2)
    : JSON.stringify(result.data, null, 2);

  // Highlight the response
  const highlightedHtml = shikiLoading
    ? `<pre class="bg-zinc-900 p-4 rounded-lg"><code class="text-zinc-300 text-sm font-mono">${escapeHtml(responseText)}</code></pre>`
    : highlight(responseText, "json");

  return (
    <div className={cn("rounded-lg bg-zinc-900 overflow-hidden", className)}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              result.success ? "bg-emerald-500" : "bg-red-500"
            )}
          />
          <span className="text-sm text-zinc-400">
            {result.success ? "Success" : "Error"}
          </span>
          {result.status > 0 && (
            <span className="text-xs text-zinc-500 font-mono">
              ({result.status})
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500 font-mono">
          {result.processingTimeMs}ms
        </span>
      </div>

      {/* Response body */}
      <div
        className={cn(
          "max-h-[400px] overflow-auto",
          "[&_pre]:m-0 [&_pre]:rounded-none [&_pre]:bg-transparent",
          "[&_code]:text-sm"
        )}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}

/**
 * Escape HTML special characters for fallback display
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}
