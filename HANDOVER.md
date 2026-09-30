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

- **Next.js 15** App Router. The customer menu is still fully static
  (`○ /` prerendered); `/admin/*` is dynamic (`ƒ`).
- **React 18.3**
- **Supabase** — Postgres (menu content), Storage (dish photos), Auth (owner
  login). Added for the admin dashboard; see **ADMIN-SETUP.md**.
- **Tailwind CSS 3.4** — `darkMode: ["selector", '[data-theme="dark"]']`
- **TypeScript**
- **`next/font`** self-hosting: Cormorant Garamond (display Latin), Manrope (body Latin), Amiri (display Arabic), Cairo (body Arabic). Unicode-range scoping means Arabic fonts only download when Arabic codepoints render.
- **No animation library.** Framer Motion was removed; all motion is CSS keyframes in `app/globals.css`.

Build size last measured: **14.3 kB page / 120 kB First Load JS**. The page
shrank ~5 kB when the menu stopped being imported into the client bundle — it
now arrives in the RSC payload instead.

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

**Supabase is the source of truth.** `data/menu.json` is now a committed
*snapshot*, not the live data.

`getMenu()` in `lib/menu-data.ts` resolves in this order:

1. Supabase, when `NEXT_PUBLIC_SUPABASE_*` are set.
2. `data/menu.json`, when they aren't **or when the query fails**.

That second branch is intentional beyond dev convenience: if Supabase is
unreachable at build time, a QR scan still returns a complete menu instead of
an error page. Refresh the snapshot with `npm run snapshot` and commit it —
that also gives the owner's edits a plain-text history in git.

App-level shape (unchanged from before, so every component kept working):
```ts
type MenuItem = {
  id: string;                 // the dish SLUG — DOM ids + sessionStorage order keys
  name: LocalizedText;
  price: number;              // DA, integer
  description?: LocalizedText;
  image?: string;             // Supabase Storage URL, /public/ path, or remote URL
  width?: number;
  height?: number;
};
```

**Slugs are frozen after creation.** A dish slug keys the customer's
in-progress order in `sessionStorage["deb-order"]`; a category slug is its
`#anchor` for CategoryNav's scroll-spy. Renaming either in /admin changes the
displayed title but never the slug — see the comment in `updateCategory`.

`scripts/extract-dimensions.mjs` still walks the JSON snapshot. New photos
uploaded through /admin don't need it — the cropper knows its own output
dimensions and writes them straight to the row.

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
  NoticeModal.tsx         ← accessible dialog with the +30% rule card
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

  MenuProvider.tsx        ← carries the server-fetched menu to client components
  OrderMenuSync.tsx       ← prunes order lines whose dish was deleted/hidden

lib/
  i18n.ts                 ← Lang type, message bundles, t() and pick() helpers
  menu-data.ts            ← getMenu(): Supabase with JSON fallback
  restaurant.ts           ← constants: hours, phone, social URLs
  theme.ts                ← Theme type, default, storage key

scripts/
  extract-dimensions.mjs  ← bake image dimensions into the JSON
  seed-supabase.mjs       ← one-shot data/menu.json → Supabase (npm run seed)
  snapshot-menu.mjs       ← Supabase → data/menu.json (npm run snapshot)

data/
  menu.json               ← offline fallback snapshot (generated)

supabase/
  schema.sql              ← tables, RLS policies, storage bucket. Run once.
```

### Admin dashboard (`/admin`)

Owner-facing, French-only, mobile-first. Full setup in **ADMIN-SETUP.md**.

```
middleware.ts             ← guards /admin/*, refreshes the session cookie.
                            Matcher is scoped to /admin ONLY — matching "/"
                            would force the static menu through the Node
                            runtime on every QR scan.

app/admin/
  layout.tsx              ← noindex metadata; renders <SetupRequired> if unconfigured
  login/page.tsx          ← branded sign-in
  (dashboard)/
    layout.tsx            ← re-checks the session, mounts <AdminShell>
    page.tsx              ← stats, quick actions, recently edited
    dishes/               ← list (search / filter / reorder / show-hide), new, [id]
    categories/           ← list (reorder), new, [id]
    loading.tsx  error.tsx  not-found.tsx

lib/supabase/
  env.ts                  ← isSupabaseConfigured, requireSupabaseEnv
  public.ts               ← cookie-LESS anon client. Used by getMenu() so the
                            menu page stays statically rendered.
  server.ts               ← cookie-bound client + getCurrentUser()
  client.ts               ← memoized browser client (login, image upload)
  types.ts                ← hand-written Database types mirroring schema.sql

lib/admin/
  queries.ts              ← dashboard reads (includes hidden dishes)
  dish-actions.ts         ← "use server" CRUD + reorder + availability
  category-actions.ts     ← "use server" CRUD + reorder
  validation.ts           ← hand-rolled, French error messages
  storage.ts              ← Storage URL ⇄ object path
  format.ts               ← price, relative time, slugify, deaccent

components/admin/
  AdminShell.tsx          ← sidebar on md+; on phones a top bar + bottom tabs
                            (Accueil · Plats · + · Catégories · Compte). Tabs
                            hide on create/edit screens, which have a save bar.
  Dashboard.tsx           ← home: stats, recent edits, "À vérifier", per-category
  DishList.tsx            ← search (/), status filter, sticky category bar
                            (jump + scroll-spy), inline price edit,
                            visibility switch with undo, reorder mode, and a
                            ⋯ sheet per dish (modifier / masquer / supprimer).
                            Tapping anywhere on a row (photo included)
                            opens the edit screen; Dish/CategoryForm put
                            "Supprimer" on the title row as well.
  DishForm.tsx            ← cards + live DishPreview + sticky FormActionBar
  DishPreview.tsx         ← the REAL MenuItemCard, inert, in `.menu-tokens`
  CategoryList.tsx  CategoryForm.tsx
  ImageUploader.tsx       ← pick / camera / drag-drop, upload, orphan cleanup,
                            "Retoucher" reopens the editor on the original
  ImageEditor.tsx         ← canvas editor: crop, 90° turns, mirror, straighten,
                            zoom, colour sliders + styles → 1200×900 JPEG ≤ ~260 KB
  BrandMark.tsx  DishThumb.tsx  SetupRequired.tsx  LoginForm.tsx  icons.tsx
  ui/                     ← Button, Field, Switch/Toggle, Toast (with undo),
                            ConfirmDialog, Sheet, Card, Badge/Kbd, Segmented,
                            Slider, EmptyState, Skeleton, FormActionBar,
                            useModal (focus trap / Escape / scroll lock),
                            Portal (see "Overlays" below)
```

---

## UX decisions worth knowing

These are non-obvious choices the user iterated to; don't undo without asking.

- **Dark mode is the default**, OS preference ignored. Only an explicit toggle overrides it.
- **French is the default**, `navigator.language` ignored. Only an explicit pick overrides.
- **NoticeModal auto-opens on first session visit**, gated by `sessionStorage["deb-notice-seen"]`. Backdrop click does NOT dismiss — only Escape or the button. The banner is the persistent way to re-open it.
- **Surcharge card in the notice** shows +30% in 34 px gold tabular-nums, gold-tinted card surface, soft entrance fade (260 ms) to draw the eye after the modal settles. It covers traditional dishes served on the terrace and includes the "(sauf bourak)" exclusion per owner's clarification. The former +20% card (fish on the ground floor) was removed at the owner's request — fish downstairs carries no surcharge.
- **Search was removed** from the customer menu — not needed at this size.
  (The admin dish list *does* have search; the owner scans a flat list of 37,
  a customer browses by category.)
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

5. ~~JSON-backed menu via build-time import~~ — **done.** The owner now edits
   in `/admin` and changes reach the live menu without a redeploy.

6. **Admin forms are French-only.** The `_en` / `_ar` columns exist and the 24
   migrated dishes keep their translations, but nothing in the UI writes to
   them, so a dish renamed in French keeps its old English/Arabic name. Adding
   FR/EN/AR tabs touches `DishForm`, `CategoryForm`, and the two action files.

7. **Abandoned photo uploads can orphan a file.** The uploader writes to
   Storage as soon as you confirm the crop, so leaving a form without saving
   leaves the object behind. Re-cropping before saving cleans up the previous
   attempt, and replacing/deleting a saved photo cleans up properly — only the
   "uploaded then navigated away" path leaks. At ~200 KB against a 1 GB free
   tier this is not urgent; a sweep script comparing bucket contents against
   `dishes.image_url` would close it.


---

## Admin design decisions worth knowing

- **The admin UI is French only.** The customer menu is trilingual because
  customers are; the dashboard has exactly one user and he works in French.
- **The dashboard has its own palette and font**, scoped to `.admin-root`
  (see the "Admin dashboard" block in `globals.css`). It redefines the same
  semantic variables — warm off-white / white cards in light, near-black in
  dark, ink or gold actions — so admin components still write `bg-surface`,
  `text-muted`… and the customer menu is untouched. Inter is loaded in
  `app/admin/layout.tsx` only, so QR-scan visitors never download it. Extra
  tokens for the admin: `danger-*`, `success-*`, `warning-*`, and the
  `shadow-admin-*` scale (true drop shadows; the menu's shadows are tinted
  with `--fg`, which glows cream in dark mode).
- **`.menu-tokens` re-applies the customer palette** (and Manrope) inside the
  admin. The dish form's live preview renders the real `MenuItemCard` in it,
  so what the owner sees is what customers get.
- **The photo editor is canvas-based, no library.** Colour work runs on a
  560 px copy while a slider is dragged and a 1600 px copy at rest; the
  export re-runs the same pixel function on the 1200×900 output, so preview
  and saved file match. Photos above 16 MP are downscaled first (iOS canvas
  limit). The editor always uses the dark palette (`data-theme="dark"` on
  its root) — photos are judged on a neutral dark surround.
- **Optimistic everything in the lists.** Visibility, inline price and
  reorder render instantly and roll back with a toast if the server refuses.
  Visibility and price toasts offer "Annuler". Reorder keeps its local order
  while arrow taps are still in flight (`movesInFlight`), otherwise the
  first server reply would snap the list back mid-sequence.
- **Overlays always go through `<Portal>`** (dialogs, sheets, the photo
  editor). It mounts them directly in `.admin-root`, outside every page
  wrapper. Rendered in place, an overlay's z-index only counts inside the
  nearest stacking context: that is how the phone's sticky top bar once
  covered the editor's Annuler / Appliquer buttons, leaving no way out.
  Relatedly, the page fade uses `animation-fill-mode: backwards` so the
  wrapper stops being a stacking context once it has faded in.
- **Phone-first (iPhone) details:** 16px inputs (no Safari zoom on focus),
  44px touch targets (the Toggle pads its hit area with `::before`), editor
  actions at the bottom under the thumb, `enterKeyHint`/no autocorrect on
  search, camera shortcut via `capture="environment"`.
- **Keyboard shortcuts (desktop):** `N` new dish, `/` search, `Ctrl/⌘ S`
  save a form, `Esc` closes any dialog/sheet/editor.
- **Hide beats delete.** Every dish has an `is_available` toggle, surfaced as a
  one-tap eye button in the list, because "sold out tonight" is the most
  frequent edit a restaurant makes.
- **Reordering is arrow buttons, not drag-and-drop.** Touch DnD needs a library
  and is fiddly one-handed. Dishes get an explicit "Réorganiser" mode (search
  and filters are ignored there — swapping with a hidden neighbour would be
  confusing); categories show arrows permanently since the list is short.
- **Position changes are a two-row swap, not a re-index**, so concurrent edits
  in different parts of the menu can't clobber each other.
- **The delete dialog focuses Cancel**, and category deletes state the dish
  count in the confirm button (`Supprimer (12 plats)`).

## What the user might ask next

- **Add FR/EN/AR tabs to the admin forms** (see deferred item 6) — the most
  likely follow-up now that the dashboard exists.
- Make the restaurant settings editable too: hours, phone, socials and the
  +30% terrace surcharge copy are still hardcoded in `lib/restaurant.ts` and
  `lib/i18n.ts`.
- Self-host the remaining `quiikly.com` photos — several dishes still point at
  a host that is unreachable (deferred item 1). Re-uploading them through
  /admin is now the easiest fix.
- Replace placeholder descriptions with owner-provided copy.
- Review the Arabic translations.
- Set up Vercel deploy (`npx vercel --prod` is zero-config from this repo) —
  remember the two `NEXT_PUBLIC_SUPABASE_*` env vars, and **not** the service
  role key.

---

## Verification commands

```sh
npm install
npm run dev          # http://localhost:3000 — menu; /admin for the dashboard
npm run build        # production build, currently clean
npm start            # serve the built site

npm run seed         # data/menu.json → Supabase (one-shot; --force to re-import)
npm run snapshot     # Supabase → data/menu.json (refresh the offline fallback)
npm run extract-dimensions   # bake image dimensions into data/menu.json
```

Last `next build`: clean. `/` is `○ Static` at 14.3 kB / 120 kB First Load;
all `/admin/*` routes are `ƒ Dynamic`. Middleware 90.6 kB, scoped to /admin.

There is **no ESLint config** in this repo — `npm run lint` will offer to
create one. `npx tsc --noEmit` is the type gate.

---

## House style for this codebase

- Semantic Tailwind tokens only — no `bg-[#...]` hex in components.
- Logical positioning (`start-X`, `end-X`, `ms-X`, `me-X`) — never `left-X`/`right-X` for layout. RTL must work.
- Client components only when necessary (hooks, context, browser APIs). Most components are client because of i18n / theme / order context.
- All interactive elements get explicit `aria-label`s in the active language and `touch-manipulation` for iOS responsiveness.
- `prefers-reduced-motion` is honored globally via the existing media query in `globals.css`.
- Don't introduce framer-motion or any animation library. CSS keyframes only.
