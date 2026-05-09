"use client";

import { useEffect, useRef, useState } from "react";
import { LANG_LABEL, LANG_NAME, SUPPORTED_LANGS } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";

export function LanguagePicker() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="absolute end-3 top-3 z-30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("langPickerLabel")}
        className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-ink-800/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-sand-50 backdrop-blur-md transition hover:bg-ink-800/80"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
        {LANG_LABEL[lang]}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("langPickerLabel")}
          className="absolute end-0 mt-2 w-36 overflow-hidden rounded-lg border border-sand-200 bg-white shadow-card"
        >
          {SUPPORTED_LANGS.map((l) => {
            const active = l === lang;
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLang(l);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-[13px] transition ${
                    active
                      ? "bg-sand-100 text-ink"
                      : "text-ink-700 hover:bg-sand-50"
                  }`}
                >
                  <span>{LANG_NAME[l]}</span>
                  <span className="text-[10px] uppercase tracking-widest text-gold-deep">
                    {LANG_LABEL[l]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
