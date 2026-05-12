"use client";

import { useT } from "./LanguageProvider";

/**
 * Editorial section marker that bridges the notice strip and the sticky
 * category nav. Two gold hairlines flank a tiny diamond on each side, and
 * the eyebrow text sits between them — the same vocabulary used by the
 * section headers, scaled down so it reads as an introduction rather than
 * a category title.
 */
export function MenuTitle() {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl px-6 pb-4 pt-7 text-center">
      <div className="flex items-center justify-center gap-3 text-accent">
        <span
          aria-hidden="true"
          className="block h-px w-10 origin-right animate-hairline-grow bg-gradient-to-l from-accent/60 to-transparent"
        />
        <svg
          aria-hidden="true"
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className="animate-ornament-spin"
        >
          <path
            d="M4 0.5 L7.5 4 L4 7.5 L0.5 4 Z"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
            opacity="0.85"
          />
        </svg>
        <span className="text-[11px] font-medium uppercase tracking-[0.38em] text-accent-strong">
          {t("menuLabel")}
        </span>
        <svg
          aria-hidden="true"
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className="animate-ornament-spin"
          style={{ animationDelay: "1.2s" }}
        >
          <path
            d="M4 0.5 L7.5 4 L4 7.5 L0.5 4 Z"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
            opacity="0.85"
          />
        </svg>
        <span
          aria-hidden="true"
          className="block h-px w-10 origin-left animate-hairline-grow bg-gradient-to-r from-accent/60 to-transparent"
        />
      </div>
    </div>
  );
}
