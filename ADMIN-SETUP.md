# Admin dashboard — setup

The owner's dashboard lives at **`/admin`** on the same site as the menu. It is
backed by Supabase (Postgres + file storage + login).

Setup is five steps and takes about ten minutes. Steps 1–3 are already done if
`.env.local` exists and has values in it.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Region: pick the one closest to Algiers — **Frankfurt (eu-central-1)** is the
   usual choice.
3. Save the database password somewhere safe. You will not need it for this
   app, but Supabase will not show it again.

The free tier is far more than this menu needs (500 MB database, 1 GB file
storage, 50 000 monthly active users).

---

## 2. Create the tables

1. In the Supabase dashboard, open **SQL Editor** → **New query**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo, copy the
   whole file, paste it in.
3. Click **Run**.

You should see `Success. No rows returned`.

This creates the `categories` and `dishes` tables, the `menu-images` storage
bucket, and the Row Level Security policies that make the menu publicly
readable but only writable by a signed-in owner.

The script is idempotent — re-running it is safe and changes nothing.

---

## 3. Add the keys

In Supabase: **Project Settings → API**. You need three values.

```sh
cp .env.local.example .env.local
```

Then fill in `.env.local`:

| Variable | Where it comes from | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon / public" key | No — RLS is the real guard |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" key | **Yes — never commit or deploy this** |

> `.env.local` is gitignored. `.env.local.example` is **not** — it is the
> committed template, so never put real keys in it.

The service role key bypasses all Row Level Security. Only `npm run seed` reads
it, and only from your machine. It does not belong in Vercel.

---

## 4. Import the existing menu

```sh
npm run seed
```

This copies the 6 categories and 37 dishes from `data/menu.json` into Supabase,
keeping their existing French, English and Arabic text, prices, image paths and
order.

It refuses to run twice, so it can't duplicate the menu by accident. To wipe
Supabase and re-import from the JSON:

```sh
npm run seed -- --force
```

---

## 5. Create the owner's login

1. Supabase dashboard → **Authentication** → **Users** → **Add user** →
   **Create new user**.
2. Enter the owner's email and a password.
3. Tick **Auto Confirm User** — otherwise they must click a confirmation email
   before they can sign in.

That email and password are the login for `/admin`.

**There is no self-service password reset.** If the owner forgets it, reset it
from this same screen (**⋯ → Reset password**).

---

## Deploying to Vercel

Add **only these two** in Vercel → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Do **not** add `SUPABASE_SERVICE_ROLE_KEY`.

Redeploy after adding them — `next.config.mjs` reads `NEXT_PUBLIC_SUPABASE_URL`
at build time to whitelist the storage hostname for `next/image`.

---

## How it fits together

```
Owner edits a price in /admin
        ↓
  server action writes to Supabase
        ↓
  revalidatePath("/") regenerates the menu page
        ↓
  Customer scanning the QR code sees the new price
```

The customer menu stays **statically generated** — it is not rendered per
request, so a QR scan on a slow mobile connection is as fast as it was before
the dashboard existed. Freshness comes from the revalidation call, not from
server-rendering every visit.

### If Supabase is down

`getMenu()` falls back to the committed `data/menu.json` snapshot, so the menu
still loads. Keep that snapshot current:

```sh
npm run snapshot   # Supabase → data/menu.json
```

Committing the result also gives the owner's edits a plain-text history in git.

---

## What the owner can edit

| | |
|---|---|
| **Dishes** | Name, price, description, photo, category, show/hide, order, delete |
| **Categories** | Name, subtitle, order, delete (takes its dishes with it) |

Two deliberate limits:

- **French only.** The customer menu is trilingual, but the forms edit French.
  The English and Arabic already in the database are preserved untouched — the
  dashboard simply never writes to those columns. Adding FR/EN/AR tabs is a
  contained change to `DishForm` / `CategoryForm` plus the two action files.
- **Slugs are frozen after creation.** A category's slug is its `#anchor` on
  the menu and a dish's slug keys the customer's in-progress order in
  sessionStorage. Renaming "Salades" to "Entrées" changes the title everywhere
  but keeps `#salades` working.

### Photos

Uploads are cropped to 4:3, resized to 1200×900 and re-encoded as JPEG under
~260 KB before leaving the phone. Originals are never uploaded — a 6 MB camera
photo becomes roughly a 200 KB file.

Replacing or deleting a dish's photo removes the old file from storage.
Photos that ship with the repo (`/images/menu/…`) are never touched by the
dashboard, only unreferenced.

---

## Troubleshooting

**"L'espace propriétaire n'est pas encore connecté"**
`.env.local` is missing or empty. See step 3.

**"Could not find the table 'public.categories'"**
Step 2 hasn't been run. Paste `supabase/schema.sql` into the SQL Editor.

**"E-mail ou mot de passe incorrect"**
Check the user exists under Authentication → Users, and that it is confirmed.
An unconfirmed user cannot sign in.

**Photo upload fails**
Confirm the `menu-images` bucket exists and is marked public
(Storage → Buckets). Re-running `supabase/schema.sql` recreates it.

**A price changed in /admin but the menu still shows the old one**
Hard-refresh once. If it persists, the `revalidatePath` call failed — the
hourly ISR window in `app/page.tsx` will correct it regardless.
