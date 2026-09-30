"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { MenuCategory, MenuItem } from "@/lib/menu-data";

type Ctx = {
  menu: MenuCategory[];
  /** slug → item, for the order sheet's line-item lookup */
  itemsBySlug: Map<string, MenuItem>;
};

const MenuContext = createContext<Ctx | null>(null);

/**
 * Carries the menu from the server component that fetched it down to the
 * client components that render it.
 *
 * Before Supabase, `MenuExplorer` and `OrderSheet` imported `data/menu.json`
 * directly — that baked the menu into the client bundle at build time, so an
 * owner's price change could never reach a customer without a redeploy.
 */
export function MenuProvider({
  menu,
  children,
}: {
  menu: MenuCategory[];
  children: ReactNode;
}) {
  const value = useMemo<Ctx>(() => {
    const itemsBySlug = new Map<string, MenuItem>();
    for (const category of menu) {
      for (const item of category.items) itemsBySlug.set(item.id, item);
    }
    return { menu, itemsBySlug };
  }, [menu]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside <MenuProvider>");
  return ctx;
}
