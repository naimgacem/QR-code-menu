type Props = {
  variant?: "gold" | "ink";
  className?: string;
};

export function OrnamentDivider({ variant = "gold", className = "" }: Props) {
  const stroke = variant === "gold" ? "#B68A35" : "#0F0E0C";
  const opacity = variant === "gold" ? 0.85 : 0.6;

  return (
    <div
      className={`flex items-center justify-center gap-4 ${className}`}
      aria-hidden="true"
    >
      <span
        className="h-px flex-1 max-w-[80px]"
        style={{ background: stroke, opacity: opacity * 0.5 }}
      />
      <svg
        width="36"
        height="14"
        viewBox="0 0 36 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 7 L10 7"
          stroke={stroke}
          strokeOpacity={opacity}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M26 7 L34 7"
          stroke={stroke}
          strokeOpacity={opacity}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M18 1 L23 7 L18 13 L13 7 Z"
          stroke={stroke}
          strokeOpacity={opacity}
          strokeWidth="1"
          fill="none"
        />
        <circle cx="18" cy="7" r="1.4" fill={stroke} fillOpacity={opacity} />
      </svg>
      <span
        className="h-px flex-1 max-w-[80px]"
        style={{ background: stroke, opacity: opacity * 0.5 }}
      />
    </div>
  );
}
