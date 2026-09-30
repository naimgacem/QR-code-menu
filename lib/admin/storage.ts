import { MENU_IMAGES_BUCKET } from "@/lib/supabase/types";

const PUBLIC_PREFIX = `/storage/v1/object/public/${MENU_IMAGES_BUCKET}/`;

/**
 * Extracts the in-bucket object path from a Supabase Storage public URL,
 * or null for anything else.
 *
 * The null case is load-bearing, not defensive noise: dish photos can also be
 * repo files (`/images/menu/kebda.jpg`) or legacy remote URLs. Deleting a
 * dish must never try to remove those — one is a tracked file, the other
 * isn't ours.
 */
export function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const index = url.indexOf(PUBLIC_PREFIX);
  if (index === -1) return null;

  const path = url.slice(index + PUBLIC_PREFIX.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/** Storage object key for a dish photo. The random suffix busts any CDN
 * cache when a photo is replaced under the same dish. */
export function dishImagePath(slug: string, extension: string): string {
  const safeSlug = slug || "plat";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `dishes/${safeSlug}-${Date.now().toString(36)}${suffix}.${extension}`;
}
