/**
 * Meilisearch connection status indicator
 */

import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  /** Whether connected to Meilisearch */
  isConnected: boolean;
  /** Whether currently checking connection */
  isChecking: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Fixed position indicator showing Meilisearch connection status.
 * Displays a colored dot with status text.
 */
export function ConnectionStatus({
  isConnected,
  isChecking,
  className,
}: ConnectionStatusProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50",
        "text-xs font-medium",
        className
      )}
    >
      {/* Status indicator dot */}
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isChecking && "bg-amber-500 animate-pulse",
          !isChecking && isConnected && "bg-emerald-500",
          !isChecking && !isConnected && "bg-red-500"
        )}
      />

      {/* Status text */}
      <span
        className={cn(
          isChecking && "text-amber-400",
          !isChecking && isConnected && "text-emerald-400",
          !isChecking && !isConnected && "text-red-400"
        )}
      >
        {isChecking
          ? "Checking..."
          : isConnected
            ? "Meilisearch Connected"
            : "Meilisearch Offline"}
      </span>
    </div>
  );
}
