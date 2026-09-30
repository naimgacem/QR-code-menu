import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "../icons";

type Props = {
  title: string;
  subtitle?: ReactNode;
  /** Renders a back link above the title — used on the edit/create screens,
   * which are pushed views rather than tabs. */
  back?: { href: string; label: string };
  /** Small line above the title (e.g. a status badge on an edit screen). */
  eyebrow?: ReactNode;
  /** Buttons on the title row, at its end — on phones too, the way an iOS
   * navigation bar puts "Modifier" beside a large title. */
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, back, eyebrow, action }: Props) {
  return (
    <div className="mb-5 md:mb-8">
      {back && (
        <Link
          href={back.href}
          className="-ms-2 mb-2 inline-flex h-10 touch-manipulation items-center gap-1 rounded-lg pe-2.5 ps-1.5 text-[14px] font-medium text-accent-strong transition-colors hover:bg-surface-2 md:h-9 md:text-[13px] md:text-muted md:hover:text-fg"
        >
          <ChevronLeftIcon className="h-[18px] w-[18px] md:h-4 md:w-4" />
          {back.label}
        </Link>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow && <div className="mb-2">{eyebrow}</div>}
          <h1 className="text-balance text-[28px] font-bold leading-[1.15] tracking-[-0.025em] text-fg md:text-[28px] md:font-semibold">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-[14.5px] leading-snug text-muted md:mt-1.5 md:text-[14px]">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex flex-shrink-0 items-center gap-2">{action}</div>
        )}
      </div>
    </div>
  );
}
