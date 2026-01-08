/**
 * Hero/title section component for the presentation
 */

import { cn } from "@/lib/utils";
import type { TitleSection as TitleSectionType } from "@/types/presentation";

interface TitleSectionProps {
  /** Section data */
  section: TitleSectionType;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Hero section for presentation titles and introductions.
 * Displays title, subtitle, bullet points, and optional soundbite.
 */
export function TitleSection({ section, className }: TitleSectionProps) {
  return (
    <section
      id={section.anchor}
      className={cn(
        "min-h-[50vh] flex flex-col justify-center py-16",
        className
      )}
    >
      <div className="max-w-3xl">
        {/* Main title */}
        <h1 className="text-5xl md:text-6xl font-bold text-zinc-100 tracking-tight">
          {section.title}
        </h1>

        {/* Subtitle */}
        {section.subtitle && (
          <p className="text-2xl md:text-3xl text-zinc-400 mt-4 font-light">
            {section.subtitle}
          </p>
        )}

        {/* Bullet points */}
        {section.bullets && section.bullets.length > 0 && (
          <ul className="mt-8 space-y-3">
            {section.bullets.map((bullet, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-lg text-zinc-300"
              >
                <span className="text-blue-500 mt-1.5">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Soundbite quote */}
        {section.soundbite && (
          <blockquote className="mt-10 pl-6 border-l-4 border-blue-500 italic text-xl text-zinc-400">
            "{section.soundbite}"
          </blockquote>
        )}
      </div>
    </section>
  );
}
