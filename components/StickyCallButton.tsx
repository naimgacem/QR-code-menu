"use client";

import { useEffect, useState } from "react";
import { restaurant } from "@/lib/restaurant";
import { useT } from "./LanguageProvider";

const PhoneIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    className="relative text-gold-light"
  >
    <path
      d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 19V5M6 11l6-6 6 6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function StickyCallButton() {
  const t = useT();
  const [callShown, setCallShown] = useState(false);
  const [topShown, setTopShown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCallShown(y > 600);
      setTopShown(y > 1500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 end-5 z-50 flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t("fabBackToTop")}
        className={`grid h-11 w-11 place-items-center rounded-full border border-sand-200 bg-white text-ink shadow-card transition-all duration-300 hover:bg-sand-50 ${
          topShown
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <ArrowUpIcon />
      </button>
      <a
        href={`tel:${restaurant.phone}`}
        aria-label={t("fabCall")}
        className={`relative grid h-14 w-14 place-items-center rounded-full bg-ink text-sand-50 shadow-[0_18px_40px_-12px_rgba(15,14,12,0.55)] ring-1 ring-gold/30 transition-all duration-300 ${
          callShown
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-gold/20 blur-md"
        />
        <PhoneIcon />
      </a>
    </div>
  );
}
