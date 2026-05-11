"use client";

import { useEffect, useRef } from "react";
import { useT } from "./LanguageProvider";

type Props = {
  open: boolean;
  onClose: () => void;
};

const InfoMark = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 11v5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="12" cy="7.8" r="1.05" fill="currentColor" />
  </svg>
);

export function NoticeModal({ open, onClose }: Props) {
  const t = useT();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    // Focus the acknowledge button so Enter dismisses it immediately
    // and keyboard users land on the only meaningful action.
    const id = window.requestAnimationFrame(() => {
      buttonRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-ink/55 backdrop-blur-[3px]"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-title"
        aria-describedby="notice-body"
        className="relative z-[71] w-full max-w-sm animate-modal-in overflow-hidden rounded-2xl bg-sand-50 shadow-[0_30px_80px_-20px_rgba(15,14,12,0.45)] ring-1 ring-sand-200"
      >
        <div
          aria-hidden="true"
          className="h-[3px] w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />

        <div className="px-6 pt-7 pb-6 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-gold/12 text-gold-deep ring-1 ring-gold/25">
            <InfoMark />
          </div>

          <h2
            id="notice-title"
            className="mt-4 font-display text-[26px] leading-tight text-ink sm:text-[28px]"
          >
            {t("noticeTitle")}
          </h2>

          <div
            id="notice-body"
            className="mt-4 space-y-3 text-start text-[14px] leading-relaxed text-ink-700"
          >
            <p>{t("noticeIntro1")}</p>
            <p>{t("noticeIntro2")}</p>

            <ul
              className="mt-3 space-y-2 rounded-lg border border-sand-200 bg-white/70 p-3 text-[13.5px]"
              role="list"
            >
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-[7px] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold"
                />
                <span>{t("noticeBullet1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-[7px] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold"
                />
                <span>{t("noticeBullet2")}</span>
              </li>
            </ul>

            <p className="pt-1 text-center text-[12.5px] text-ink-700/75">
              {t("noticeOutro")}
            </p>
          </div>

          <button
            ref={buttonRef}
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-full bg-ink py-3 text-[12px] font-medium uppercase tracking-widest text-sand-50 transition active:scale-[0.98] hover:bg-ink-800"
          >
            {t("noticeAcknowledge")}
          </button>
        </div>
      </div>
    </div>
  );
}
