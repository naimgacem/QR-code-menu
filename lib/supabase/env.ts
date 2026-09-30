/**
 * Supabase environment access.
 *
 * Both values are `NEXT_PUBLIC_*` because the browser needs them to talk to
 * Supabase directly (login, image upload). That is expected and safe — the
 * anon key is designed to be public; Row Level Security in
 * `supabase/schema.sql` is what actually enforces access.
 *
 * The site is designed to run WITHOUT Supabase configured: `getMenu()` falls
 * back to the committed `data/menu.json` snapshot, so `npm run dev` and
 * `npm run build` both work on a fresh clone with no .env.local. Only /admin
 * hard-requires the connection.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Throws with an actionable message instead of a cryptic supabase-js error. */
export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Copy .env.local.example to .env.local and " +
        "fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "(Supabase Dashboard → Project Settings → API). See ADMIN-SETUP.md."
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
