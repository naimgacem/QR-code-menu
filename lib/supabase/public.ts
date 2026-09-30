import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Cookie-less anon client for reading the public menu.
 *
 * Deliberately NOT the `@supabase/ssr` server client: touching `cookies()`
 * opts a route out of static rendering, and the customer menu must stay
 * statically generated (it is the page every QR scan hits, often on a slow
 * mobile connection). Freshness comes from `revalidatePath("/")` fired by the
 * admin's write actions instead.
 */
export function createPublicClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
