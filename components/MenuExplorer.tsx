"use client";

import { useMemo, useState } from "react";
import { menu, type MenuCategory } from "@/lib/menu-data";
import { norm } from "@/lib/text";
import { useLang } from "./LanguageProvider";
import { CategoryNav } from "./CategoryNav";
import { MenuSection } from "./MenuSection";
import { SearchBar } from "./SearchBar";
import { StickyMenuHeader } from "./StickyMenuHeader";

export function MenuExplorer() {
  const [query, setQuery] = useState("");
  const { lang, t } = useLang();

  const filtered = useMemo<MenuCategory[]>(() => {
    const q = norm(query.trim());
    if (!q) return menu;
    return menu
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => {
          const haystack = [
            i.name.fr,
            i.name.en,
            i.name.ar,
            i.description?.fr,
            i.description?.en,
            i.description?.ar,
          ]
            .filter(Boolean)
            .join(" ");
          return norm(haystack).includes(q);
        }),
      }))
      .filter((c) => c.items.length > 0);
  }, [query]);

  const navCategories = filtered.map((c) => ({
    id: c.id,
    title: c.title[lang] ?? c.title.fr,
  }));
  const totalMatches = filtered.reduce((n, c) => n + c.items.length, 0);
  const hasQuery = query.trim().length > 0;

  return (
    <>
      <StickyMenuHeader
        search={
          <SearchBar
            value={query}
            onChange={setQuery}
            count={totalMatches}
            hasQuery={hasQuery}
            inputId="menu-search"
          />
        }
        nav={
          navCategories.length > 0 ? (
            <CategoryNav categories={navCategories} />
          ) : null
        }
      />

      {filtered.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          className="mx-auto max-w-xl px-6 py-20 text-center"
        >
          <p className="font-display text-2xl text-ink">{t("searchEmpty")}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-700/70">
            {t("searchEmptyHint")}{" "}
            <button
              type="button"
              onClick={() => setQuery("")}
              className="underline decoration-gold underline-offset-2 hover:text-ink"
            >
              {t("searchSeeAll")}
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="divide-y divide-sand-200/70">
          {filtered.map((category) => (
            <MenuSection
              key={category.id}
              category={category}
              query={query}
            />
          ))}
        </div>
      )}
    </>
  );
}
