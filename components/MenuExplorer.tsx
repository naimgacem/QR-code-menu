"use client";

import { menu } from "@/lib/menu-data";
import { useLang } from "./LanguageProvider";
import { CategoryNav } from "./CategoryNav";
import { MenuSection } from "./MenuSection";

export function MenuExplorer() {
  const { lang } = useLang();

  const navCategories = menu.map((c) => ({
    id: c.id,
    title: c.title[lang] ?? c.title.fr,
  }));

  return (
    <>
      {/* No rectangle bar — the rounded capsule from CategoryNav is the only
       * sticky element, so it reads as a floating island of pills. */}
      <div className="sticky top-0 z-40">
        <CategoryNav categories={navCategories} />
      </div>

      <div className="divide-y divide-line-soft">
        {menu.map((category) => (
          <MenuSection key={category.id} category={category} />
        ))}
      </div>
    </>
  );
}
