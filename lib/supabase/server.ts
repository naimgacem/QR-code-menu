import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Cookie-bound Supabase client for the admin area.
 *
 * Reads the session from the request cookies so RLS sees an `authenticated`
 * role. Using this in a route makes it dynamic — that is correct for /admin
 * and wrong for the customer menu, which uses `createPublicClient()` instead.
 */
export async function createServerSupabase() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // `middleware.ts` refreshes the session on every request, so
          // swallowing this is safe.
        }
      },
    },
  });
}

/**
 * The signed-in owner, or null. Prefer this over `getSession()` — it
 * revalidates the JWT with Supabase rather than trusting the cookie.
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
