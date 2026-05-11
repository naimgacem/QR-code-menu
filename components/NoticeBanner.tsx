"use client";

import { useT } from "./LanguageProvider";

type Props = {
  onClick: () => void;
};

const InfoCircle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="7.8" r="1.05" fill="currentColor" />
  </svg>
);

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 6 L15 12 L9 18"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function NoticeBanner({ onClick }: Props) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("noticeReopen")}
      className="group flex w-full touch-manipulation items-center justify-between gap-3 border-b border-sand-200/80 bg-sand-100/65 px-5 py-3 text-start text-[12.5px] leading-snug text-ink-700 transition-all duration-200 ease-out hover:bg-sand-100 hover:shadow-[inset_0_-1px_0_0_rgba(182,138,53,0.18)] active:scale-[0.995] active:bg-sand-200/70 md:cursor-pointer"
    >
      <span className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-gold/15 text-gold-deep ring-1 ring-gold/25 transition group-hover:bg-gold/20 group-hover:ring-gold/40">
          <InfoCircle />
        </span>
        <span className="font-medium text-ink/85">{t("noticeBanner")}</span>
      </span>
      <span className="flex-shrink-0 text-ink-700/40 transition-all duration-200 group-hover:text-gold-deep ltr:group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
        <Chevron />
      </span>
    </button>
  );
}
