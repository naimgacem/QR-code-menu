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
      className="scroll-mt-[80px] px-5 py-12 first:pt-8 sm:px-6"
    >
      <div className="mx-auto max-w-xl">
        <header className="mb-7 text-center">
          {category.subtitle && (
            <p className="text-[10px] uppercase tracking-widest text-accent-strong">
              {pick(category.subtitle, lang)}
            </p>
          )}
          <h2
            id={headingId}
            className="mt-2 font-display text-3xl leading-tight text-fg sm:text-4xl"
          >
            {pick(category.title, lang)}
          </h2>
          <div className="mt-3 text-accent">
            <OrnamentDivider />
          </div>
        </header>

        <ul role="list" className="space-y-5">
          {category.items.map((item) => (
            <li key={item.id}>
              <MenuItemCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
