/**
 * Inline 24×24 stroke icons for the dashboard.
 *
 * Hand-rolled rather than pulled from an icon package: the set is small, and
 * the customer menu already establishes inline SVG as the house pattern. All
 * of them inherit `currentColor` and take their size from the `className`.
 */

type IconProps = { className?: string };

const base = (className?: string) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true as const,
  className: className ?? "h-5 w-5",
});

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const HomeIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M3.5 10.5 12 3.5l8.5 7" {...stroke} />
    <path d="M5.5 9.5v10h13v-10" {...stroke} />
    <path d="M10 19.5v-5h4v5" {...stroke} />
  </svg>
);

export const DishIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M3.5 15.5h17" {...stroke} />
    <path d="M4.5 15.5a7.5 7.5 0 0 1 15 0" {...stroke} />
    <path d="M2.5 18.5h19" {...stroke} />
    <path d="M12 5.5v2.5" {...stroke} />
  </svg>
);

export const LayersIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="m12 3.5 8 4.25-8 4.25-8-4.25 8-4.25Z" {...stroke} />
    <path d="m4 12 8 4.25L20 12" {...stroke} />
    <path d="m4 16.25 8 4.25 8-4.25" {...stroke} />
  </svg>
);

export const PlusIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 5v14M5 12h14" {...stroke} />
  </svg>
);

export const PencilIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 20h4l10-10a2.5 2.5 0 0 0-4-4L4 16v4Z" {...stroke} />
    <path d="m14.5 6.5 3 3" {...stroke} />
  </svg>
);

export const TrashIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4.5 6.5h15" {...stroke} />
    <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" {...stroke} />
    <path d="M6.5 6.5 7.5 20a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-13.5" {...stroke} />
    <path d="M10.5 10.5v6.5M13.5 10.5v6.5" {...stroke} />
  </svg>
);

export const SearchIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="11" cy="11" r="6.5" {...stroke} />
    <path d="m16 16 4.5 4.5" {...stroke} />
  </svg>
);

export const ChevronRightIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="m9.5 5.5 6.5 6.5-6.5 6.5" {...stroke} />
  </svg>
);

export const ChevronLeftIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M14.5 5.5 8 12l6.5 6.5" {...stroke} />
  </svg>
);

export const ArrowUpIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 19V5M6 11l6-6 6 6" {...stroke} />
  </svg>
);

export const ArrowDownIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 5v14M6 13l6 6 6-6" {...stroke} />
  </svg>
);

export const CameraIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path
      d="M3.5 8.5h3l1.5-2.5h8l1.5 2.5h3v11h-17v-11Z"
      {...stroke}
    />
    <circle cx="12" cy="13.5" r="3.5" {...stroke} />
  </svg>
);

export const EyeIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...stroke} />
    <circle cx="12" cy="12" r="3" {...stroke} />
  </svg>
);

export const EyeOffIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M2.5 12S6 5.5 12 5.5c1.6 0 3 .45 4.2 1.1" {...stroke} />
    <path d="M19.4 9.1c1.3 1.5 2.1 2.9 2.1 2.9S18 18.5 12 18.5c-1.9 0-3.5-.65-4.8-1.5" {...stroke} />
    <path d="m4 4 16 16" {...stroke} />
  </svg>
);

export const LogoutIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M14.5 4.5h-8a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5h8" {...stroke} />
    <path d="M17 8.5 20.5 12 17 15.5" {...stroke} />
    <path d="M20 12h-9" {...stroke} />
  </svg>
);

export const ExternalIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M14 4.5h5.5V10" {...stroke} />
    <path d="m19.5 4.5-8 8" {...stroke} />
    <path d="M18 14v5.5H4.5V6H10" {...stroke} />
  </svg>
);

export const CheckIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} />
  </svg>
);

export const AlertIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 4.5 21 20H3l9-15.5Z" {...stroke} />
    <path d="M12 10v4" {...stroke} />
    <circle cx="12" cy="17" r="0.9" fill="currentColor" />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="m6 6 12 12M18 6 6 18" {...stroke} />
  </svg>
);

export const ImageIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="3.5" y="5" width="17" height="14" rx="2" {...stroke} />
    <circle cx="9" cy="10" r="1.6" {...stroke} />
    <path d="m4.5 17 4.5-4.5 3.5 3.5 3-2.5 4 3.5" {...stroke} />
  </svg>
);

export const UploadIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9" {...stroke} />
    <path d="M4.5 14.5v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3.5" {...stroke} />
  </svg>
);

export const SunIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="4" {...stroke} />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" {...stroke} />
  </svg>
);

export const MoonIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" {...stroke} />
  </svg>
);

export const UserIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="8.5" r="3.75" {...stroke} />
    <path d="M4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5" {...stroke} />
  </svg>
);

export const CopyIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" {...stroke} />
    <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" {...stroke} />
  </svg>
);

export const MailIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" {...stroke} />
    <path d="m4 7 8 6 8-6" {...stroke} />
  </svg>
);

export const LockIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" {...stroke} />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...stroke} />
  </svg>
);

export const RotateLeftIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4.5 9.5A8 8 0 1 1 5 15" {...stroke} />
    <path d="M4.5 4.5v5h5" {...stroke} />
  </svg>
);

export const RotateRightIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M19.5 9.5A8 8 0 1 0 19 15" {...stroke} />
    <path d="M19.5 4.5v5h-5" {...stroke} />
  </svg>
);

export const FlipIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 3.5v17" {...stroke} strokeDasharray="2 2.5" />
    <path d="M9 7 3.5 17.5H9V7Z" {...stroke} />
    <path d="M15 7l5.5 10.5H15V7Z" {...stroke} />
  </svg>
);

export const CropIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M6.5 2.5v13.5a1.5 1.5 0 0 0 1.5 1.5h13.5" {...stroke} />
    <path d="M2.5 6.5h13.5a1.5 1.5 0 0 1 1.5 1.5v13.5" {...stroke} />
  </svg>
);

export const SlidersIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" {...stroke} />
    <circle cx="15" cy="7" r="2" {...stroke} />
    <circle cx="9" cy="17" r="2" {...stroke} />
  </svg>
);

export const SparkleIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5Z" {...stroke} />
    <path d="M18.5 15.5c.25 1.6 1 2.35 2.5 2.5-1.5.25-2.25 1-2.5 2.5-.25-1.5-1-2.25-2.5-2.5 1.5-.15 2.25-.9 2.5-2.5Z" {...stroke} />
  </svg>
);

export const ResetIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" {...stroke} />
    <path d="M4.5 4.5v4h4" {...stroke} />
  </svg>
);

export const CompareIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="3.5" y="5" width="17" height="14" rx="2" {...stroke} />
    <path d="M12 3v18" {...stroke} />
    <path d="M12 5h6.5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H12Z" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

export const UndoIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M9 14.5 4.5 10 9 5.5" {...stroke} />
    <path d="M4.5 10h10a5 5 0 0 1 0 10H11" {...stroke} />
  </svg>
);

export const ClockIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="8.5" {...stroke} />
    <path d="M12 7.5V12l3 2" {...stroke} />
  </svg>
);

export const InfoIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="8.5" {...stroke} />
    <path d="M12 11v5" {...stroke} />
    <circle cx="12" cy="8" r="0.9" fill="currentColor" />
  </svg>
);

export const ListIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M9 6.5h11M9 12h11M9 17.5h11" {...stroke} />
    <circle cx="4.75" cy="6.5" r="0.9" fill="currentColor" />
    <circle cx="4.75" cy="12" r="0.9" fill="currentColor" />
    <circle cx="4.75" cy="17.5" r="0.9" fill="currentColor" />
  </svg>
);

export const ReorderIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M8 4.5v15M4.5 8 8 4.5 11.5 8" {...stroke} />
    <path d="M16 19.5v-15M12.5 16l3.5 3.5 3.5-3.5" {...stroke} />
  </svg>
);
