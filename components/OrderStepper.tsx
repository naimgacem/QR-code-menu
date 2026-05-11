"use client";

import { useT } from "./LanguageProvider";

type Props = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
};

const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 7h14M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function OrderStepper({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
}: Props) {
  const t = useT();

  const dims =
    size === "sm"
      ? { btn: "h-7 w-7", num: "min-w-[1.5rem] text-[12.5px]" }
      : { btn: "h-9 w-9", num: "min-w-[1.75rem] text-[14px]" };

  return (
    <div
      className="inline-flex items-center rounded-full bg-action text-action-fg shadow-sm ring-1 ring-action transition"
      role="group"
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label={quantity === 1 ? t("orderRemove") : t("orderDecrease")}
        className={`grid ${dims.btn} touch-manipulation place-items-center rounded-full transition hover:bg-action-hover active:scale-[0.92]`}
      >
        {quantity === 1 ? <TrashIcon /> : <MinusIcon />}
      </button>
      <span
        key={quantity}
        className={`animate-count-pop text-center font-semibold tabular-nums ${dims.num}`}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label={t("orderIncrease")}
        className={`grid ${dims.btn} touch-manipulation place-items-center rounded-full transition hover:bg-action-hover active:scale-[0.92]`}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
