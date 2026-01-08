/**
 * Demo section component with executable commands
 */

import { ExecutableCommand } from "@/components/code/ExecutableCommand";
import { cn } from "@/lib/utils";
import type {
  DemoSection as DemoSectionType,
  ExecutableCommand as ExecutableCommandType,
  CommandResult,
  FileData,
} from "@/types/presentation";

interface DemoSectionProps {
  /** Section data */
  section: DemoSectionType;
  /** Execution results keyed by command ID */
  results: Map<string, CommandResult>;
  /** Set of currently executing command IDs */
  executingCommands: Set<string>;
  /** Pre-loaded file data */
  fileData: FileData;
  /** Callback when a command is executed */
  onExecuteCommand: (
    command: ExecutableCommandType,
    modifiedEndpoint: string,
    modifiedBody?: string
  ) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Section containing executable API commands.
 * Each command can be edited and executed, with results displayed inline.
 */
export function DemoSection({
  section,
  results,
  executingCommands,
  fileData,
  onExecuteCommand,
  className,
}: DemoSectionProps) {
  return (
    <section id={section.anchor} className={cn("py-12", className)}>
      {/* Section title */}
      <h2 className="text-3xl font-bold text-zinc-100 mb-4">{section.title}</h2>

      {/* Notes */}
      {section.notes && section.notes.length > 0 && (
        <div className="mb-8 bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <h4 className="text-sm font-semibold text-zinc-400 mb-2">
            What to observe:
          </h4>
          <ul className="space-y-1.5">
            {section.notes.map((note, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-zinc-300"
              >
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Commands */}
      <div className="space-y-8">
        {section.commands.map((command) => (
          <ExecutableCommand
            key={command.id}
            command={command}
            result={results.get(command.id)}
            isExecuting={executingCommands.has(command.id)}
            fileData={{ json: fileData.json, csv: fileData.csv }}
            onExecute={onExecuteCommand}
          />
        ))}
      </div>

      {/* Expected response example (if provided) */}
      {section.expectedResponse && (
        <div className="mt-8 bg-zinc-900/30 rounded-lg p-4 border border-zinc-800">
          <h4 className="text-sm font-semibold text-zinc-400 mb-2">
            Expected response structure:
          </h4>
          <pre className="text-xs text-zinc-500 font-mono overflow-x-auto">
            {section.expectedResponse}
          </pre>
        </div>
      )}
    </section>
  );
}
