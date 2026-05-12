"use client";

import type { MenuCategory } from "@/lib/menu-data";
import { pick } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";
import { MenuItemCard } from "./MenuItemCard";
import { OrnamentDivider } from "./OrnamentDivider";

type Props = {
  category: MenuCategory;
};

export function MenuSection({ category }: Props) {
  const { lang } = useLang();
  const headingId = `${category.id}-heading`;
  return (
    <section
      id={category.id}
      aria-labelledby={headingId}
      className="scroll-mt-[80px] px-5 py-14 first:pt-10 sm:px-6"
    >
      <div className="mx-auto max-w-xl">
        <header className="mb-9 text-center">
          {category.subtitle && (
            <p className="text-[10px] uppercase tracking-[0.32em] text-accent-strong">
              <span aria-hidden="true" className="me-2 inline-block align-middle text-accent/55">·</span>
              {pick(category.subtitle, lang)}
              <span aria-hidden="true" className="ms-2 inline-block align-middle text-accent/55">·</span>
            </p>
          )}
          <h2
            id={headingId}
            className="mt-3 font-display text-[34px] font-medium leading-[1.05] text-fg sm:text-[40px]"
          >
            {pick(category.title, lang)}
          </h2>
          <div className="mt-4 text-accent">
            <OrnamentDivider />
          </div>
        </header>

        <ul role="list" className="space-y-6">
          {category.items.map((item, i) => (
            <li
              key={item.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 60, 360)}ms` }}
            >
              <MenuItemCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
