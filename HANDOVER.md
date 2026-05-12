# HANDOVER — Dar El Baraka QR Menu

> Quick context for the next Claude session. Read top-to-bottom once; the project is small and the design decisions are intentional.

---

## What this is

Mobile-first digital menu for **Dar El Baraka**, a traditional Algerian restaurant in the Casbah of Algiers. Accessed by customers scanning a QR code at the table. The owner wanted something premium, warm, culturally grounded — not a generic SaaS-looking page.

**Repo:** https://github.com/naimgacem/QR-code-menu
**Local path:** `c:\Users\tassili\Desktop\menu`
**Working dir is a git repo, main is in sync with origin.**

---

## Stack

- **Next.js 15** App Router, fully static (`○ /` prerendered)
- **React 18.3**
- **Tailwind CSS 3.4** — `darkMode: ["selector", '[data-theme="dark"]']`
- **TypeScript**
- **`next/font`** self-hosting: Cormorant Garamond (display Latin), Manrope (body Latin), Amiri (display Arabic), Cairo (body Arabic). Unicode-range scoping means Arabic fonts only download when Arabic codepoints render.
- **No animation library.** Framer Motion was removed; all motion is CSS keyframes in `app/globals.css`.

Build size last measured: **~19 kB page / ~119 kB First Load JS**.

---

## Design-system architecture (the centerpiece)

All visual decisions go through **CSS variables → Tailwind semantic tokens**. No hardcoded hex anywhere in components.

**Source of truth:** `app/globals.css` — defines two themes via `[data-theme="light|dark"]` selectors. Values are RGB triplets so Tailwind's `<alpha-value>` syntax works (`bg-surface/70` works correctly).

**Tailwind binding:** `tailwind.config.ts` maps each token to `rgb(var(--name) / <alpha-value>)`.

**Semantic tokens (use these, never invent new colors):**

| Group | Tokens |
|---|---|
| Canvas | `app`, `surface`, `surface-2`, `surface-muted`, `surface-overlay` |
| Lines | `line`, `line-soft` |
| Text | `fg`, `muted`, `subtle` |
| Accent (gold) | `accent`, `accent-strong`, `accent-hover`, `accent-soft` |
| Action (CTA) | `action`, `action-hover`, `action-fg` |
| Status | `status-open`, `status-open-fg`, `status-closed`, `status-closed-fg` |
| Hero band | `hero-bg`, `hero-fg`, `hero-fg-muted`, `hero-accent` |
| Outer frame (desktop) | `frame` |

**Light mode** is warm linen — restrained saturation, intentionally **not** pure white. `--app` is `#E8E2D0`. Cards lift via subtle lightness (`#EFEAD9`). Inactive chips on the capsule use `--surface-2` (`#E2DCC7`) — just a 5 % shade against the capsule, deliberately subtle (user iterated this twice).

**Dark mode** is warm restaurant evening — no pure black. `--app` is `#0F0A05` (deep coffee), surfaces are espresso/leather (`#1B130C`, `#231A11`). Accent is warm muted gold (`#D6AC57`). Action color flips: dark mode buttons are gold with espresso text (in light mode they're ink with cream text).

**Hero is theme-aware** — own `hero-*` token group. Light mode: warm sand band (`#C9B991`). Dark mode: same deep coffee as the app bg. The ArchPattern inside uses `currentColor` so it recolors automatically.

---

## Theming + i18n providers

**Provider chain** in `app/layout.tsx`:
```
ThemeProvider → LanguageProvider → OrderProvider → children
```

**Anti-FOIT (flash of incorrect theme):** inline `<script>` runs synchronously in `<body>` before React hydrates, reads `localStorage["deb-theme"]`, sets `data-theme` on `<html>`. Default is **dark** — OS `prefers-color-scheme` is intentionally ignored (the dark evening palette is the restaurant's identity).

**Language:** stored as `localStorage["deb-lang"]`. Default is **French**, regardless of `navigator.language`. The picker lives in the hero corner. Arabic flips `<html dir="rtl">` and triggers logical positioning everywhere (`start-X`, `end-X`, `ms-X`, `me-X`).

**Translation API:**
- UI strings: `lib/i18n.ts` exports `t(lang, key, replacements?)`. Use the `useT()` hook in client components.
- Menu data: `pick(localizedText, lang)` — falls back to FR when EN/AR missing.
- Localized fields shape: `{ fr: string; en?: string; ar?: string }`.

---

## Menu data

`data/menu.json` is the single source of truth. The owner can edit prices, items, photos, descriptions, and ship without touching code.

Schema (also see `lib/menu-data.ts`):
```ts
type MenuItem = {
  id: string;                 // kebab-case, used in DOM ids and order state
  name: LocalizedText;
  price: number;              // DA, integer
  description?: LocalizedText;
  image?: string;             // full URL or /public/ path
  width?: number;             // baked-in natural dimensions; optional
  height?: number;            // (populated by `npm run extract-dimensions`)
};
```

`scripts/extract-dimensions.mjs` walks the JSON, fetches each image, parses JPEG/PNG/WebP headers, and writes `width`/`height` back. Idempotent; `-- --force` to refetch.

---

## Component map

```
app/
  layout.tsx          ← provider chain, anti-FOIT script, fonts, theme color
  page.tsx            ← top-level composition (Hero → NoticeSystem → MenuTitle → MenuExplorer → Contact → FAB stack → OrderSheet)
  globals.css         ← all CSS variables, keyframes, Arabic spacing overrides

components/
  Hero.tsx                ← theme-aware header band; mounts ThemeToggle + LanguagePicker
  ArchPattern.tsx         ← decorative Moorish-arch SVG, uses currentColor
  OrnamentDivider.tsx     ← small flourish for category headings
  OpenStatus.tsx          ← live open/closed pill; ticks every 60s
  LanguageProvider.tsx    ← React context for active lang
  LanguagePicker.tsx      ← FR/EN/AR dropdown in hero corner
  ThemeProvider.tsx       ← React context for active theme
  ThemeToggle.tsx         ← sun/moon button in hero corner
  SkipLink.tsx            ← sr-only "Aller au menu" focus-visible link

  NoticeSystem.tsx        ← coordinator: auto-opens modal on first session visit
  NoticeModal.tsx         ← accessible dialog with the +20% / +30% rule cards
  NoticeBanner.tsx        ← clickable strip that re-opens the modal

  MenuTitle.tsx           ← eyebrow "MENU" with flanking gold hairlines
  MenuExplorer.tsx        ← sticky CategoryNav wrapper + MenuSection list
  CategoryNav.tsx         ← rounded-full capsule with chip pills, edge fades, IntersectionObserver scroll-spy
  MenuSection.tsx         ← per-category list with OrnamentDivider header
  MenuItemCard.tsx        ← photo + name + price + description + AddToOrderButton

  OrderProvider.tsx       ← React context; sessionStorage["deb-order"]
  OrderStepper.tsx        ← [-] N [+] pill (trash icon at qty 1)
  AddToOrderButton.tsx    ← per-card toggle between "Ajouter +" and OrderStepper
  OrderFAB.tsx            ← floating "Ma commande · N" pill, visible when count > 0
  OrderSheet.tsx          ← bottom-sheet review panel
  BackToTopButton.tsx     ← FAB after 1500px scroll

  Contact.tsx             ← compact footer with phone/maps/IG/FB icons + ©

lib/
  i18n.ts                 ← Lang type, message bundles, t() and pick() helpers
  menu-data.ts            ← JSON loader + types
  restaurant.ts           ← constants: hours, phone, social URLs
  theme.ts                ← Theme type, default, storage key

scripts/
  extract-dimensions.mjs  ← bake image dimensions into the JSON

data/
  menu.json               ← single source of truth for menu content
```

---

## UX decisions worth knowing

These are non-obvious choices the user iterated to; don't undo without asking.

- **Dark mode is the default**, OS preference ignored. Only an explicit toggle overrides it.
- **French is the default**, `navigator.language` ignored. Only an explicit pick overrides.
- **NoticeModal auto-opens on first session visit**, gated by `sessionStorage["deb-notice-seen"]`. Backdrop click does NOT dismiss — only Escape or the button. The banner is the persistent way to re-open it.
- **Surcharge cards in the notice** have +20% / +30% in 34 px gold tabular-nums, gold-tinted card surface, soft entrance stagger (260 ms / 380 ms) to draw the eye after the modal settles. Rule 2 includes "(sauf bourak)" exclusion per owner's clarification.
- **Search was removed.** Not needed for a 24-item menu.
- **Tag icons (fish/meat/leaf) were removed** from cards — owner didn't want them. Don't add back unprompted.
- **Made-up descriptions were stripped.** Only Salade Verte (ingredient list) and Service de thé ("4 personnes") came from the original quiikly site and are real. Everything else is awaiting owner copy.
- **Category capsule:** chips inside center via `mx-auto` on an inner flex (not `justify-content: center`, which breaks horizontal scroll when content overflows). Inactive chips use `bg-surface-2` — deliberately subtle, user pushed back twice when it was too dark.
- **`main` uses `overflow-x-clip`, NOT `overflow-hidden`.** The latter breaks `position: sticky` for the category nav. This caused a real bug; don't change it back.
- **Page is wrapped** in `max-w-xl mx-auto` with `bg-frame` body on `md+` — looks like a contained mobile-app card on tablet/desktop.
- **Hero stays theme-aware.** Light mode: warm sand. Dark mode: deep coffee. The logo round glow and gold accents persist in both.
- **Arabic typography:** `:lang(ar)` rules in `globals.css` neutralize all `tracking-*` utilities (Latin letter-spacing breaks Arabic letter-joining) and bump line-height to 1.7 for comfortable reading.
- **Order system is a viewing aid, not a cart.** No payment, no checkout, no backend. The "show this to the waiter" line in the OrderSheet footer is the entire mental model.
- **OrderSheet's "Total"** — the user explicitly stripped the "Estimated total / For reference only" subtext. Don't reintroduce it.

---

## Known issues / deferred work

1. **Image hosting:** All photos load from `quiikly.com`, the original menu provider. `quiikly.com` is currently unreachable (DNS failure on the user's network and from any sandboxed environment). In dev, the Next.js image optimizer returns 500 for each one. **Fix:** download the photos from the restaurant's Instagram or owner's archive into `public/menu/<dish-id>.jpg`, then update `image` fields in `data/menu.json` from full URLs to `/menu/...` paths. `extract-dimensions.mjs` would benefit from a small tweak to handle local paths if you go this route.

2. **Arabic translations are mine, not a native speaker's.** They're idiomatic but the owner / a fluent Algerian Arabic speaker should review — especially regional dish-name transliterations. User has already corrected one: Dziriyat is **دزيريات**, not جزيريات.

3. **Most dish descriptions are placeholders.** They're currently stripped (empty) per the owner — waiting for the owner's exact menu copy.

4. **Per-image natural aspect ratio** is detected on load via `onLoadingComplete` (clamped 4:5 → 16:9), causing a brief one-time layout shift before the image's native ratio is applied. To eliminate, run `npm run extract-dimensions` once after images are self-hosted; the script bakes the dimensions into the JSON and the cards skip the detection step.

5. **JSON-backed menu via build-time import is fine,** but for true zero-redeploy updates (owner editing without a developer), the next step would be moving `data/menu.json` into `/public/menu.json` and fetching at runtime, or wiring up a tiny CMS (Sanity, Notion API, Google Sheets via SheetDB).


---

## What the user might ask next

- Run the `frontend-design` skill for a holistic redesign pass (highest-likelihood next ask).
- Self-host the menu photos and update `data/menu.json` image paths.
- Replace placeholder descriptions with owner-provided copy.
- Review the Arabic translations.
- Set up Vercel deploy (`npx vercel --prod` is zero-config from this repo).

---

## Verification commands

```sh
npm install
npm run dev          # http://localhost:3000
npm run build        # production build, currently clean
npm start            # serve the built site
npm run extract-dimensions   # bake image dimensions into data/menu.json (idempotent)
```

Last `next build` output: clean, page 19.x kB / First Load 119 kB, fully static.

---

## House style for this codebase

- Semantic Tailwind tokens only — no `bg-[#...]` hex in components.
- Logical positioning (`start-X`, `end-X`, `ms-X`, `me-X`) — never `left-X`/`right-X` for layout. RTL must work.
- Client components only when necessary (hooks, context, browser APIs). Most components are client because of i18n / theme / order context.
- All interactive elements get explicit `aria-label`s in the active language and `touch-manipulation` for iOS responsiveness.
- `prefers-reduced-motion` is honored globally via the existing media query in `globals.css`.
- Don't introduce framer-motion or any animation library. CSS keyframes only.
