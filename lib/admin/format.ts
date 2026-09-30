/** Formatting helpers for the dashboard. French locale throughout — the
 * owner works in French even though the customer menu is trilingual. */

const priceFormatter = new Intl.NumberFormat("fr-FR");

/** 1500 → "1 500". The "DA" suffix is rendered separately so it can be
 * styled as a unit rather than part of the number. */
export const formatPrice = (value: number) => priceFormatter.format(value);

const relativeFormatter = new Intl.RelativeTimeFormat("fr", {
  numeric: "auto",
});

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60_000],
  ["month", 30 * 24 * 60 * 60_000],
  ["week", 7 * 24 * 60 * 60_000],
  ["day", 24 * 60 * 60_000],
  ["hour", 60 * 60_000],
  ["minute", 60_000],
];

/** ISO timestamp → "il y a 2 heures". Returns null for missing input. */
export function formatRelative(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const elapsed = then - Date.now();
  const magnitude = Math.abs(elapsed);

  for (const [unit, ms] of UNITS) {
    if (magnitude >= ms) {
      return relativeFormatter.format(Math.round(elapsed / ms), unit);
    }
  }
  return "à l'instant";
}

/**
 * Lowercases and drops accents: "Pâtisseries" → "patisseries".
 *
 * Used for both slugs and search. Search needs it because the owner types on
 * a phone keyboard and will not reach for "â" when looking up "pate".
 */
export const deaccent = (input: string): string =>
  input
    .normalize("NFD")
    // strip the combining accents NFD just split off
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Free text → url-safe slug, e.g. "Pâtisseries traditionnelles" →
 * "patisseries-traditionnelles". The result becomes the category anchor on
 * the customer menu.
 */
export function slugify(input: string): string {
  return deaccent(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Truncates on a word boundary for list previews. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
