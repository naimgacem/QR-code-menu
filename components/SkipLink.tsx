"use client";

import { useT } from "./LanguageProvider";

export function SkipLink() {
  const t = useT();
  return (
    <a
      href="#menu"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-action focus:px-4 focus:py-2 focus:text-action-fg focus:shadow-card"
    >
      {t("skipToMenu")}
    </a>
  );
}
