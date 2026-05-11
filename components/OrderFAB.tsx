"use client";

import { useT } from "./LanguageProvider";
import { useOrder } from "./OrderProvider";

const BasketIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 8h14l-1.4 10a3 3 0 0 1-3 2.6H9.4a3 3 0 0 1-3-2.6L5 8Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 8V6a3 3 0 0 1 6 0v2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export function OrderFAB() {
  const t = useT();
  const { count, setOpen } = useOrder();
  const visible = count > 0;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={t("orderOpenAria", { n: count })}
      className={`relative inline-flex touch-manipulation items-center gap-2.5 rounded-full bg-action px-5 py-3 text-action-fg shadow-[0_18px_40px_-12px_rgb(var(--fg)/0.55)] ring-1 ring-action transition-all duration-300 ease-out hover:bg-action-hover active:scale-[0.97] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <BasketIcon />
      <span className="text-[13px] font-semibold tracking-wide">
        {t("orderTitle")}
      </span>
      <span
        key={count}
        className="inline-flex h-6 min-w-[1.5rem] animate-count-pop items-center justify-center rounded-full bg-action-fg/15 px-1.5 text-[12px] font-bold tabular-nums"
        aria-hidden="true"
      >
        {count}
      </span>
    </button>
  );
}
