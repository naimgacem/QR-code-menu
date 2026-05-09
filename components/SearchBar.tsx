"use client";

import { useT } from "./LanguageProvider";

type Props = {
  value: string;
  onChange: (v: string) => void;
  count: number;
  hasQuery: boolean;
  inputId?: string;
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="m20 20-3.5-3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m6 6 12 12M18 6 6 18"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export function SearchBar({ value, onChange, count, hasQuery, inputId }: Props) {
  const t = useT();
  return (
    <div className="relative">
      <label className="relative block">
        <span className="sr-only">{t("searchLabel")}</span>
        <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-ink-700/55">
          <SearchIcon />
        </span>
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          autoComplete="off"
          spellCheck="false"
          enterKeyHint="search"
          aria-label={t("searchLabel")}
          aria-describedby="search-results-status"
          className="w-full rounded-full border border-sand-200 bg-white py-3 ps-11 pe-12 text-[14px] text-ink placeholder:text-ink-700/40 shadow-card transition focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        {value && (
          <button
            type="button"
            aria-label={t("searchClear")}
            onClick={() => onChange("")}
            className="absolute end-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-700/65 transition hover:bg-sand-100 hover:text-ink"
          >
            <CloseIcon />
          </button>
        )}
      </label>
      <p
        id="search-results-status"
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {hasQuery ? t("searchResults", { n: count }) : ""}
      </p>
    </div>
  );
}
