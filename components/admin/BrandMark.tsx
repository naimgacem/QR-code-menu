/** The dashboard's mark: a Moorish arch — the motif of the menu's hero
 * pattern — in gold on a soft tile. Drawn inline rather than using the
 * restaurant logo, which is still hosted on the unreachable quiikly.com. */
export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid flex-shrink-0 place-items-center rounded-[10px] bg-accent-soft text-accent-strong ring-1 ring-inset ring-accent/25 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[62%] w-[62%]">
        <path
          d="M12 2.75c4.5 0 7.25 3.35 7.25 7.6V21.25H4.75V10.35c0-4.25 2.75-7.6 7.25-7.6Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M12 7.25c2.3 0 3.75 1.75 3.75 4v10H8.25v-10c0-2.25 1.45-4 3.75-4Z"
          fill="currentColor"
          fillOpacity="0.28"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <BrandMark className={compact ? "h-8 w-8" : "h-9 w-9"} />
      <div className="min-w-0">
        <p className="truncate font-display text-[19px] font-medium leading-none tracking-[0.005em] text-fg">
          Dar El Baraka
        </p>
        <p className="mt-1 truncate text-[10.5px] font-medium uppercase tracking-[0.14em] text-subtle">
          Espace propriétaire
        </p>
      </div>
    </div>
  );
}
