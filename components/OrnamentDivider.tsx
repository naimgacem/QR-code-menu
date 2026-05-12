type Props = {
  className?: string;
};

/**
 * Small horizontal flourish: two short rules flanking a diamond + dot.
 * The diamond breathes via a slow CSS rotation, and the flanking rules
 * fade in from the outside on first paint. Inherits `currentColor` so it
 * themes automatically.
 */
export function OrnamentDivider({ className = "" }: Props) {
  return (
    <div
      className={`flex items-center justify-center gap-4 ${className}`}
      aria-hidden="true"
    >
      <span
        className="h-px max-w-[80px] flex-1 origin-right animate-hairline-grow bg-gradient-to-l from-current via-current/70 to-transparent"
        style={{ opacity: 0.55 }}
      />
      <svg
        width="36"
        height="14"
        viewBox="0 0 36 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-ornament-spin"
      >
        <path
          d="M2 7 L10 7"
          stroke="currentColor"
          strokeOpacity="0.85"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M26 7 L34 7"
          stroke="currentColor"
          strokeOpacity="0.85"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M18 1 L23 7 L18 13 L13 7 Z"
          stroke="currentColor"
          strokeOpacity="0.85"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="18" cy="7" r="1.4" fill="currentColor" />
      </svg>
      <span
        className="h-px max-w-[80px] flex-1 origin-left animate-hairline-grow bg-gradient-to-r from-current via-current/70 to-transparent"
        style={{ opacity: 0.55 }}
      />
    </div>
  );
}
