"use client";

import { useEffect, useRef } from "react";
import { useT } from "./LanguageProvider";

type Props = {
  open: boolean;
  onClose: () => void;
};

const InfoMark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="7.8" r="1.05" fill="currentColor" />
  </svg>
);

function RuleCard({
  percent,
  where,
  delay,
}: {
  percent: number;
  where: string;
  delay: number;
}) {
  return (
    <li
      className="group relative flex animate-fade-up items-center gap-4 overflow-hidden rounded-xl bg-accent/10 px-4 py-3 ring-1 ring-accent/25"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-accent/60"
      />
      {/* breathing gold glow behind the percent — subtle, draws the eye */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 start-0 w-20 animate-gold-breathe bg-gradient-to-r from-accent/15 to-transparent"
      />
      <div
        className="price-display relative flex-shrink-0 ps-1 text-[38px] italic font-medium leading-none text-accent-strong"
        dir="ltr"
      >
        +{percent}
        <span className="ms-0.5 align-baseline text-[22px] font-semibold not-italic">
          %
        </span>
      </div>
      <p className="relative flex-1 text-start text-[13.5px] font-medium leading-snug text-fg">
        {where}
      </p>
    </li>
  );
}

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
        className="absolute inset-0 animate-fade-in bg-app/55 backdrop-blur-[3px]"
        style={{ willChange: "opacity", transform: "translateZ(0)" }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-title"
        aria-describedby="notice-body"
        className="relative z-[71] w-full max-w-sm animate-modal-in overflow-hidden rounded-2xl bg-surface-overlay shadow-modal ring-1 ring-line-soft"
      >
        <div
          aria-hidden="true"
          className="h-[3px] w-full bg-gradient-to-r from-transparent via-accent/60 to-transparent"
        />

        <div className="px-6 pb-6 pt-7 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent/12 text-accent-strong ring-1 ring-accent/25">
            <InfoMark />
          </div>

          <h2
            id="notice-title"
            className="mt-4 font-display text-[26px] leading-tight text-fg sm:text-[28px]"
          >
            {t("noticeTitle")}
          </h2>

          <div
            id="notice-body"
            className="mt-4 space-y-3 text-start text-[14px] leading-relaxed text-muted"
          >
            <p>{t("noticeIntro1")}</p>
            <p>{t("noticeIntro2")}</p>

            <div className="pt-2">
              <div
                aria-hidden="true"
                className="mb-2 flex items-center gap-3"
              >
                <span className="h-px flex-1 bg-line-soft" />
                <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-accent-strong">
                  {t("noticeRulesEyebrow")}
                </span>
                <span className="h-px flex-1 bg-line-soft" />
              </div>

              <ul role="list" className="space-y-2.5">
                <RuleCard
                  percent={20}
                  where={t("noticeRule1Where")}
                  delay={260}
                />
                <RuleCard
                  percent={30}
                  where={t("noticeRule2Where")}
                  delay={380}
                />
              </ul>
            </div>

            <p className="pt-1 text-center text-[12.5px] text-subtle">
              {t("noticeOutro")}
            </p>
          </div>

          <button
            ref={buttonRef}
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-full bg-action py-3 text-[12px] font-medium uppercase tracking-widest text-action-fg transition hover:bg-action-hover active:scale-[0.98]"
          >
            {t("noticeAcknowledge")}
          </button>
        </div>
      </div>
    </div>
  );
}
