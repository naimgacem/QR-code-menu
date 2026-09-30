"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, getCurrentUser } from "@/lib/supabase/server";
import { MENU_IMAGES_BUCKET } from "@/lib/supabase/types";
import { slugify } from "./format";
import { storagePathFromUrl } from "./storage";
import {
  hasErrors,
  nullIfBlank,
  validateDish,
  validatePrice,
  type DishInput,
  type FieldErrors,
} from "./validation";

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; errors?: FieldErrors; message?: string };

const AUTH_ERROR: ActionResult = {
  ok: false,
  message: "Votre session a expiré. Reconnectez-vous.",
};

/** Regenerates the customer menu and every dashboard screen after a write.
 * Without the "/" call the owner would save a price and still see the old
 * one on the live site until the hourly ISR window elapsed. */
function revalidateMenu() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

type Supabase = Awaited<ReturnType<typeof createServerSupabase>>;

/**
 * Finds a free slug near `base`, appending -2, -3, … on collision.
 * Slugs are globally unique because they double as DOM anchor ids on the
 * customer menu, where two "salade" sections would break scroll-spy.
 */
async function uniqueDishSlug(
  supabase: Supabase,
  base: string
): Promise<string> {
  const root = base || "plat";
  for (let n = 1; n <= 50; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const { data } = await supabase
      .from("dishes")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/** Appends to the end of the destination category. */
async function nextPosition(
  supabase: Supabase,
  categoryId: string
): Promise<number> {
  const { data } = await supabase
    .from("dishes")
    .select("position")
    .eq("category_id", categoryId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? data.position + 1 : 0;
}

/** Best-effort removal of an orphaned photo. A failure here is logged and
 * swallowed: the row change already succeeded, and a stray file in the
 * bucket is not worth failing the owner's save over. */
async function removeStoredImage(supabase: Supabase, url: string | null) {
  const path = storagePathFromUrl(url);
  if (!path) return;
  const { error } = await supabase.storage
    .from(MENU_IMAGES_BUCKET)
    .remove([path]);
  if (error) {
    console.error(`[admin] could not delete image ${path}:`, error.message);
  }
}

// ---------------------------------------------------------------------------

export async function createDish(input: DishInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const errors = validateDish(input);
  if (hasErrors(errors)) return { ok: false, errors };

  const supabase = await createServerSupabase();
  const slug = await uniqueDishSlug(supabase, slugify(input.nameFr));
  const position = await nextPosition(supabase, input.categoryId);

  const { data, error } = await supabase
    .from("dishes")
    .insert({
      category_id: input.categoryId,
      slug,
      name_fr: input.nameFr.trim(),
      name_en: null,
      name_ar: null,
      description_fr: nullIfBlank(input.descriptionFr),
      description_en: null,
      description_ar: null,
      price: input.price,
      image_url: input.imageUrl,
      image_width: input.imageWidth,
      image_height: input.imageHeight,
      is_available: input.isAvailable,
      position,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: `Enregistrement impossible : ${error.message}` };
  }

  revalidateMenu();
  return { ok: true, id: data.id };
}

export async function updateDish(
  id: string,
  input: DishInput
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const errors = validateDish(input);
  if (hasErrors(errors)) return { ok: false, errors };

  const supabase = await createServerSupabase();

  const { data: existing, error: readError } = await supabase
    .from("dishes")
    .select("image_url, category_id")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    return { ok: false, message: `Lecture impossible : ${readError.message}` };
  }
  if (!existing) {
    return { ok: false, message: "Ce plat n'existe plus." };
  }

  // Moving a dish to another category puts it at the end of that one; its old
  // position number is meaningless in the new list.
  const movedCategory = existing.category_id !== input.categoryId;
  const repositioned = movedCategory
    ? { position: await nextPosition(supabase, input.categoryId) }
    : {};

  const { error } = await supabase
    .from("dishes")
    .update({
      category_id: input.categoryId,
      name_fr: input.nameFr.trim(),
      description_fr: nullIfBlank(input.descriptionFr),
      price: input.price,
      image_url: input.imageUrl,
      image_width: input.imageWidth,
      image_height: input.imageHeight,
      is_available: input.isAvailable,
      ...repositioned,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: `Enregistrement impossible : ${error.message}` };
  }

  // Only once the row is safely updated — otherwise a failed save would have
  // already destroyed the photo it still points at.
  if (existing.image_url && existing.image_url !== input.imageUrl) {
    await removeStoredImage(supabase, existing.image_url);
  }

  revalidateMenu();
  return { ok: true, id };
}

export async function deleteDish(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const supabase = await createServerSupabase();

  const { data: existing } = await supabase
    .from("dishes")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) {
    return { ok: false, message: `Suppression impossible : ${error.message}` };
  }

  await removeStoredImage(supabase, existing?.image_url ?? null);

  revalidateMenu();
  return { ok: true, id };
}

export async function setDishAvailability(
  id: string,
  isAvailable: boolean
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("dishes")
    .update({ is_available: isAvailable })
    .eq("id", id);

  if (error) {
    return { ok: false, message: `Modification impossible : ${error.message}` };
  }

  revalidateMenu();
  return { ok: true, id };
}

/** Price-only update, for the dish list's inline edit. Narrower than
 * `updateDish` on purpose: it can't clobber a name or photo that was
 * changed from another device since the list loaded. */
export async function updateDishPrice(
  id: string,
  price: number
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const priceError = validatePrice(price);
  if (priceError) return { ok: false, message: priceError };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("dishes")
    .update({ price })
    .eq("id", id);

  if (error) {
    return { ok: false, message: `Modification impossible : ${error.message}` };
  }

  revalidateMenu();
  return { ok: true, id };
}

/**
 * Swaps a dish with its neighbour inside the same category.
 *
 * Swapping two rows keeps every other dish's position untouched, so two
 * edits to different parts of the menu can't clobber each other the way a
 * full re-index would.
 */
export async function moveDish(
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const supabase = await createServerSupabase();

  const { data: dish } = await supabase
    .from("dishes")
    .select("id, category_id, position")
    .eq("id", id)
    .maybeSingle();

  if (!dish) return { ok: false, message: "Ce plat n'existe plus." };

  const { data: siblings, error } = await supabase
    .from("dishes")
    .select("id, position")
    .eq("category_id", dish.category_id);

  if (error) {
    return { ok: false, message: `Déplacement impossible : ${error.message}` };
  }

  const ordered = (siblings ?? []).sort((a, b) => a.position - b.position);
  const index = ordered.findIndex((d) => d.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  // Already at the edge — a no-op, not an error.
  if (index === -1 || targetIndex < 0 || targetIndex >= ordered.length) {
    return { ok: true, id };
  }

  const neighbour = ordered[targetIndex];
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("dishes").update({ position: neighbour.position }).eq("id", id),
    supabase
      .from("dishes")
      .update({ position: dish.position })
      .eq("id", neighbour.id),
  ]);

  if (e1 || e2) {
    return {
      ok: false,
      message: `Déplacement impossible : ${(e1 ?? e2)?.message}`,
    };
  }

  revalidateMenu();
  return { ok: true, id };
}
