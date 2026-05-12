"use client";

import { useT } from "./LanguageProvider";

/**
 * Subtle section title that marks the start of the menu, sitting
 * between the notice banner and the sticky category nav. Two gold
 * hairlines flank the label for an editorial, intentional feel.
 */
export function MenuTitle() {
  const t = useT();
  return (
    <div className="mx-auto max-w-xl px-6 pt-6 pb-4 text-center">
      <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-accent-strong">
        <span className="h-px w-12 bg-accent/40" aria-hidden="true" />
        {t("menuLabel")}
        <span className="h-px w-12 bg-accent/40" aria-hidden="true" />
      </span>
    </div>
  );
}
