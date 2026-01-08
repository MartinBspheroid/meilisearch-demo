/**
 * React hook for Shiki syntax highlighting
 * Uses singleton pattern to avoid re-initialization
 */

import { useEffect, useState, useCallback } from "react";
import type { BundledLanguage, Highlighter } from "shiki";
import { createHighlighter } from "shiki";

export type SupportedLanguage = "bash" | "json" | "typescript" | "javascript";

interface UseShikiReturn {
  /** The Shiki highlighter instance */
  highlighter: Highlighter | null;
  /** Whether the highlighter is still loading */
  isLoading: boolean;
  /** Error if initialization failed */
  error: Error | null;
  /** Highlight code and return HTML string */
  highlight: (code: string, lang: SupportedLanguage) => string;
}

/** Singleton promise to avoid multiple initializations */
let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Get or create the Shiki highlighter singleton
 */
function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: ["bash", "json", "typescript", "javascript"],
    });
  }
  return highlighterPromise;
}

/**
 * React hook for syntax highlighting with Shiki.
 * Initializes the highlighter once and provides a highlight function.
 *
 * @example
 * ```tsx
 * const { highlight, isLoading } = useShiki();
 *
 * if (isLoading) return <div>Loading...</div>;
 *
 * const html = highlight('const x = 1;', 'typescript');
 * return <div dangerouslySetInnerHTML={{ __html: html }} />;
 * ```
 */
export function useShiki(): UseShikiReturn {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    getHighlighter()
      .then((hl) => {
        if (mounted) {
          setHighlighter(hl);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const highlight = useCallback(
    (code: string, lang: SupportedLanguage): string => {
      if (!highlighter) {
        // Return escaped code as fallback
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
      }

      try {
        return highlighter.codeToHtml(code, {
          lang: lang as BundledLanguage,
          theme: "github-dark",
        });
      } catch (err) {
        console.error("Shiki highlight error:", err);
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
      }
    },
    [highlighter]
  );

  return { highlighter, isLoading, error, highlight };
}

/**
 * Escape HTML special characters
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
