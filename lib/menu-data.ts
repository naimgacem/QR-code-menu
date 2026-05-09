import data from "@/data/menu.json";
import type { LocalizedText } from "./i18n";

export type MenuItem = {
  id: string;
  name: LocalizedText;
  price: number;
  description?: LocalizedText;
  image?: string;
  /** natural pixel dimensions of `image`, populated by `npm run extract-dimensions` */
  width?: number;
  height?: number;
};

export type MenuCategory = {
  id: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  items: MenuItem[];
};

type MenuFile = {
  categories: MenuCategory[];
};

export const menu: MenuCategory[] = (data as unknown as MenuFile).categories;
