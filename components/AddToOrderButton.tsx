"use client";

import { useT } from "./LanguageProvider";
import { useOrder } from "./OrderProvider";
import { OrderStepper } from "./OrderStepper";

type Props = {
  itemId: string;
  itemName: string;
};

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export function AddToOrderButton({ itemId, itemName }: Props) {
  const t = useT();
  const { quantityOf, add, increment, decrement } = useOrder();
  const qty = quantityOf(itemId);

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(itemId)}
        aria-label={t("orderAddAria", { name: itemName })}
        className="inline-flex touch-manipulation items-center gap-1.5 rounded-full bg-action px-3.5 py-1.5 text-[12.5px] font-medium tracking-wide text-action-fg shadow-sm transition-all duration-200 hover:bg-action-hover active:scale-[0.96]"
      >
        <PlusIcon />
        {t("orderAdd")}
      </button>
    );
  }

  return (
    <OrderStepper
      quantity={qty}
      onIncrement={() => increment(itemId)}
      onDecrement={() => decrement(itemId)}
      size="sm"
    />
  );
}
