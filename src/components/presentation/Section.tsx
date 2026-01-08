/**
 * Section wrapper component for anchor targeting
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionProps {
  /** Anchor ID for navigation */
  id: string;
  /** Section content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Wrapper component for presentation sections.
 * Provides consistent padding and scroll offset for anchor targeting.
 */
export function Section({ id, children, className }: SectionProps) {
  return (
    <div
      id={id}
      className={cn(
        // Offset for fixed header and smooth scroll targeting
        "scroll-mt-20",
        className
      )}
    >
      {children}
    </div>
  );
}
