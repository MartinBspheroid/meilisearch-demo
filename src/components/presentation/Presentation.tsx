/**
 * Main presentation container component
 */

import { ConnectionStatus } from "@/components/presentation/ConnectionStatus";
import { TableOfContents } from "@/components/presentation/TableOfContents";
import { TitleSection } from "@/components/sections/TitleSection";
import { ConceptSection } from "@/components/sections/ConceptSection";
import { DemoSection } from "@/components/sections/DemoSection";
import { useMeilisearch } from "@/hooks/useMeilisearch";
import { useFileData } from "@/hooks/useFileData";
import { cn } from "@/lib/utils";
import type {
  PresentationData,
  Section,
  TitleSection as TitleSectionType,
  ConceptSection as ConceptSectionType,
  DemoSection as DemoSectionType,
  ExecutableCommand,
} from "@/types/presentation";
import { useCallback } from "react";

interface PresentationProps {
  /** Presentation content data */
  data: PresentationData;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main presentation container with scrollable content and sticky sidebar.
 * Orchestrates all sections, API execution, and navigation.
 */
export function Presentation({ data, className }: PresentationProps) {
  const { isConnected, isChecking, results, executingCommands, executeCommand } =
    useMeilisearch();
  const fileData = useFileData();

  // Handler for executing commands from demo sections
  const handleExecuteCommand = useCallback(
    (
      command: ExecutableCommand,
      _modifiedEndpoint: string,
      modifiedBody?: string
    ) => {
      // Get the appropriate file data if needed
      let bodyData: string | undefined;
      if (command.requiresFileData === "json") {
        bodyData = fileData.json ?? undefined;
      } else if (command.requiresFileData === "csv") {
        bodyData = fileData.csv ?? undefined;
      } else {
        bodyData = modifiedBody;
      }

      executeCommand(command, bodyData);
    },
    [executeCommand, fileData]
  );

  // Render a section based on its type
  const renderSection = (section: Section) => {
    switch (section.type) {
      case "title":
        return (
          <TitleSection
            key={section.id}
            section={section as TitleSectionType}
          />
        );
      case "concept":
        return (
          <ConceptSection
            key={section.id}
            section={section as ConceptSectionType}
          />
        );
      case "demo":
        return (
          <DemoSection
            key={section.id}
            section={section as DemoSectionType}
            results={results}
            executingCommands={executingCommands}
            fileData={fileData}
            onExecuteCommand={handleExecuteCommand}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-zinc-950 text-zinc-100",
        "scroll-smooth",
        className
      )}
    >
      {/* Fixed header with connection status */}
      <header className="fixed top-0 right-0 z-50 p-4">
        <ConnectionStatus isConnected={isConnected} isChecking={isChecking} />
      </header>

      {/* Main layout: sidebar + content */}
      <div className="flex">
        {/* Sticky sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-zinc-800 p-6">
          <div className="sticky top-6">
            {/* Logo/title */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-zinc-100">{data.title}</h2>
              <p className="text-xs text-zinc-500 mt-1">{data.totalDuration}</p>
            </div>

            {/* Table of contents */}
            <TableOfContents sections={data.sections} />
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 min-w-0">
          <div className="px-6 lg:px-12 py-8">
            {/* File data loading status */}
            {fileData.isLoading && (
              <div className="mb-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-3 text-zinc-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
                  <span className="text-sm">Loading transaction data...</span>
                </div>
              </div>
            )}

            {fileData.error && (
              <div className="mb-8 p-4 bg-amber-900/20 rounded-lg border border-amber-800/50">
                <p className="text-sm text-amber-400">
                  <strong>Warning:</strong> {fileData.error}
                </p>
                <p className="text-xs text-amber-500/70 mt-1">
                  Run <code>bun generate_financial_data.ts</code> to generate
                  test data.
                </p>
              </div>
            )}

            {/* Render all sections */}
            <div className="space-y-16">
              {data.sections.map(renderSection)}
            </div>

            {/* Footer */}
            <footer className="mt-24 pt-8 border-t border-zinc-800 text-center">
              <p className="text-sm text-zinc-500">
                Meilisearch Lightning Talk Presentation
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-zinc-600">
                <a
                  href="https://www.meilisearch.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-400 transition-colors"
                >
                  Documentation
                </a>
                <span>•</span>
                <a
                  href="https://github.com/meilisearch/meilisearch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-400 transition-colors"
                >
                  GitHub
                </a>
                <span>•</span>
                <a
                  href="https://cloud.meilisearch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-400 transition-colors"
                >
                  Cloud
                </a>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
