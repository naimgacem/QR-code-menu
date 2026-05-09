# Dar El Baraka — QR Menu

Mobile-first digital menu for [Dar El Baraka](https://www.instagram.com/restaurant_dar_el_baraka/), a traditional Algerian restaurant in the Casbah of Algiers. Designed to be opened from a QR code at the table.

## Stack

- Next.js 15 (App Router, fully static)
- Tailwind CSS 3
- TypeScript
- `next/font` self-hosting Cormorant Garamond + Manrope
- No client-side animation library — pure CSS keyframes

## What's inside

- Trilingual UI (FR / EN / AR) with RTL support, picker top-right
- Live "ouvert / fermé" status pill, ticks every 60s
- Sticky search + category nav, accent-insensitive fuzzy filter, match highlighting
- Per-image natural aspect ratio (clamped 4:5 → 16:9)
- Collapsible house notice, back-to-top FAB, tap-to-call FAB
- Skip link to search input, AA contrast, `prefers-reduced-motion` honored

## Local development

```sh
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm start            # serve the built site
```

## Updating the menu

All menu content lives in [`data/menu.json`](data/menu.json) — categories, items, prices, image URLs, and per-language strings. Edit the JSON, rebuild, deploy. No code changes needed for menu updates.

Each item supports:

```json
{
  "id": "kebab-case-unique-id",
  "name":        { "fr": "...", "en": "...", "ar": "..." },
  "description": { "fr": "...", "en": "...", "ar": "..." },
  "price": 1500,
  "image": "https://...",
  "width": 1200,
  "height": 900
}
```

`width` and `height` are optional — if absent, the card falls back to a 4:3 placeholder and snaps to the photo's natural ratio after it loads.

## Eliminating layout shift

To pre-encode every image's natural dimensions and remove the one-time post-load shift:

```sh
npm run extract-dimensions          # fetches each image, writes width/height back into data/menu.json
npm run extract-dimensions -- --force   # re-fetch even if dimensions already present
```

Re-running is idempotent. After it completes, commit the updated `data/menu.json`.

## Project layout

```
app/                  # Next.js App Router shell
components/           # All React components (presentation + i18n provider)
data/menu.json        # Single source of truth for menu content
lib/
  i18n.ts             # Lang type, message bundles, t() helper
  menu-data.ts        # JSON loader + types
  restaurant.ts       # Constants: hours, phone, social URLs
  text.ts             # Diacritic-aware text utils for search
scripts/
  extract-dimensions.mjs   # Bake image dimensions into the JSON
```

## Deploy

Static export friendly — works on Vercel, Netlify, GitHub Pages, or any static host. Vercel is zero-config:

```sh
npx vercel --prod
```

Point the QR code at the deployed URL. Done.
