/**
 * Sticky sidebar table of contents with active section highlighting
 */

import { cn } from "@/lib/utils";
import type { Section } from "@/types/presentation";
import { useEffect, useState, useCallback } from "react";

interface TableOfContentsProps {
  /** All sections in the presentation */
  sections: Section[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Sticky sidebar navigation showing all sections.
 * Uses Intersection Observer to highlight the currently visible section.
 */
export function TableOfContents({ sections, className }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  // Set up Intersection Observer to track visible sections
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    sections.forEach((section) => {
      const element = document.getElementById(section.anchor);
      if (!element) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(section.anchor);
          }
        });
      }, observerOptions);

      observer.observe(element);
      observers.push(observer);
    });

    // Set initial active section
    const firstSection = sections[0];
    if (firstSection) {
      setActiveSection(firstSection.anchor);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sections]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
      e.preventDefault();
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(anchor);
      }
    },
    []
  );

  // Group sections by type for visual hierarchy
  const groupedSections = sections.reduce(
    (acc, section) => {
      if (section.type === "title") {
        acc.push({ title: section, children: [] });
      } else {
        const lastGroup = acc[acc.length - 1];
        if (lastGroup) {
          lastGroup.children.push(section);
        } else {
          acc.push({ title: null, children: [section] });
        }
      }
      return acc;
    },
    [] as Array<{ title: Section | null; children: Section[] }>
  );

  return (
    <nav
      className={cn(
        "sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto",
        "pr-4 pb-8",
        className
      )}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
        Contents
      </h3>

      <ul className="space-y-1">
        {groupedSections.map((group, groupIndex) => (
          <li key={groupIndex}>
            {/* Title section link */}
            {group.title && (
              <a
                href={`#${group.title.anchor}`}
                onClick={(e) => handleClick(e, group.title?.anchor ?? "")}
                className={cn(
                  "block py-1.5 text-sm font-medium transition-colors",
                  "hover:text-zinc-100",
                  activeSection === group.title.anchor
                    ? "text-blue-400"
                    : "text-zinc-400"
                )}
              >
                <span
                  className={cn(
                    "inline-block w-1.5 h-1.5 rounded-full mr-2",
                    activeSection === group.title.anchor
                      ? "bg-blue-400"
                      : "bg-zinc-600"
                  )}
                />
                {group.title.title}
              </a>
            )}

            {/* Child section links */}
            {group.children.length > 0 && (
              <ul className={cn("space-y-0.5", group.title && "ml-4 mt-1")}>
                {group.children.map((section) => (
                  <li key={section.anchor}>
                    <a
                      href={`#${section.anchor}`}
                      onClick={(e) => handleClick(e, section.anchor)}
                      className={cn(
                        "block py-1 text-sm transition-colors",
                        "hover:text-zinc-100",
                        activeSection === section.anchor
                          ? "text-blue-400"
                          : "text-zinc-500"
                      )}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
