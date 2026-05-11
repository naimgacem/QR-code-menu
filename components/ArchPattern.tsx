type Props = {
  className?: string;
  opacity?: number;
};

/**
 * Decorative Moorish-arch repeating pattern. Strokes inherit the parent's
 * `currentColor` so this component is automatically theme-aware — set
 * `text-hero-accent` (or any token color) on a parent to recolor.
 */
export function ArchPattern({ className = "", opacity = 0.13 }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="moorish-arches"
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M40 8 C 60 8, 72 24, 72 44 L 72 72 L 8 72 L 8 44 C 8 24, 20 8, 40 8 Z"
            stroke="currentColor"
            strokeOpacity={opacity}
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="2"
            fill="currentColor"
            fillOpacity={opacity * 1.5}
          />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#moorish-arches)" />
    </svg>
  );
}
