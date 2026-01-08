/**
 * Shiki-highlighted code block component
 */

import { useShiki, type SupportedLanguage } from "@/hooks/useShiki";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  /** Code to display */
  code: string;
  /** Programming language for syntax highlighting */
  language: SupportedLanguage;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
}

/**
 * Read-only code block with Shiki syntax highlighting.
 * Uses dark theme (github-dark) for consistency with presentation.
 */
export function CodeBlock({
  code,
  language,
  className,
  showLineNumbers = false,
}: CodeBlockProps) {
  const { highlight, isLoading } = useShiki();

  // Loading state - show plain code with styling
  if (isLoading) {
    return (
      <pre
        className={cn(
          "rounded-lg bg-zinc-900 p-4 overflow-x-auto",
          "text-sm font-mono text-zinc-300",
          className
        )}
      >
        <code>{code}</code>
      </pre>
    );
  }

  const html = highlight(code, language);

  return (
    <div
      className={cn(
        "rounded-lg overflow-x-auto",
        "[&_pre]:p-4 [&_pre]:m-0 [&_pre]:bg-zinc-900",
        "[&_code]:text-sm [&_code]:font-mono",
        showLineNumbers && "[&_pre]:pl-12 [&_.line]:relative [&_.line]:before:absolute [&_.line]:before:-left-8 [&_.line]:before:text-zinc-500 [&_.line]:before:content-[counter(line)] [&_.line]:before:counter-increment-[line]",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
