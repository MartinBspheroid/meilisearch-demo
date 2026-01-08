/**
 * Concept section component for explanatory content
 */

import { CodeBlock } from "@/components/code/CodeBlock";
import { cn } from "@/lib/utils";
import type { ConceptSection as ConceptSectionType } from "@/types/presentation";

interface ConceptSectionProps {
  /** Section data */
  section: ConceptSectionType;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Section for explaining concepts with text and optional code examples.
 * Supports subsections for grouping related content.
 */
export function ConceptSection({ section, className }: ConceptSectionProps) {
  return (
    <section id={section.anchor} className={cn("py-12", className)}>
      {/* Section title */}
      <h2 className="text-3xl font-bold text-zinc-100 mb-6">{section.title}</h2>

      {/* Main content */}
      <div className="prose prose-invert prose-zinc max-w-none">
        <div
          className="text-zinc-300 text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(section.content) }}
        />
      </div>

      {/* Main code example */}
      {section.codeExample && (
        <div className="mt-6">
          <CodeBlock
            code={section.codeExample.code}
            language={section.codeExample.language}
          />
        </div>
      )}

      {/* Subsections */}
      {section.subsections && section.subsections.length > 0 && (
        <div className="mt-10 space-y-10">
          {section.subsections.map((subsection, index) => (
            <div key={index} className="border-l-2 border-zinc-700 pl-6">
              <h3 className="text-xl font-semibold text-zinc-200 mb-3">
                {subsection.title}
              </h3>
              <div
                className="text-zinc-400 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(subsection.content),
                }}
              />
              {subsection.codeExample && (
                <div className="mt-4">
                  <CodeBlock
                    code={subsection.codeExample.code}
                    language={subsection.codeExample.language}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Simple markdown-like parser for basic formatting.
 * Supports: **bold**, *italic*, `code`, and line breaks.
 */
function parseMarkdown(text: string): string {
  return text
    // Bold: **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    // Italic: *text* or _text_
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    // Inline code: `code`
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-400">$1</code>'
    )
    // Line breaks
    .replace(/\n\n/g, "</p><p class='mt-4'>")
    .replace(/\n/g, "<br />");
}
