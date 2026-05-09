type Props = {
  className?: string;
  color?: string;
  opacity?: number;
};

export function ArchPattern({
  className = "",
  color = "#B68A35",
  opacity = 0.12,
}: Props) {
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
            stroke={color}
            strokeOpacity={opacity}
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="2"
            fill={color}
            fillOpacity={opacity * 1.5}
          />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#moorish-arches)" />
    </svg>
  );
}
