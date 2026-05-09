"use client";

import { useT } from "./LanguageProvider";

export function NoticeBar() {
  const t = useT();
  return (
    <aside
      aria-label={t("noticeLabel")}
      className="border-b border-sand-200/70 bg-sand-100/55"
    >
      <details className="group mx-auto max-w-xl px-6 py-3 [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-center gap-2 text-[12px] text-ink-700/80 transition hover:text-ink">
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold-deep">
            {t("noticeLabel")}
          </span>
          <span>{t("noticeTeaser")}</span>
          <span
            aria-hidden="true"
            className="ms-1 transition-transform group-open:rotate-180"
          >
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 5 L7 9 L11 5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <div className="mt-3 text-center">
          <p className="text-[13px] leading-relaxed text-ink-700">
            {t("noticeP1")}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-700">
            {t("noticeP2")} <span aria-hidden="true">🕓</span>
          </p>
        </div>
      </details>
    </aside>
  );
}
