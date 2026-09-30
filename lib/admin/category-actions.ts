"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, getCurrentUser } from "@/lib/supabase/server";
import { MENU_IMAGES_BUCKET } from "@/lib/supabase/types";
import { slugify } from "./format";
import { storagePathFromUrl } from "./storage";
import {
  hasErrors,
  nullIfBlank,
  validateCategory,
  type CategoryInput,
} from "./validation";
import type { ActionResult } from "./dish-actions";

export type { ActionResult };

const AUTH_ERROR: ActionResult = {
  ok: false,
  message: "Votre session a expiré. Reconnectez-vous.",
};

function revalidateMenu() {
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

type Supabase = Awaited<ReturnType<typeof createServerSupabase>>;

async function uniqueCategorySlug(
  supabase: Supabase,
  base: string
): Promise<string> {
  const root = base || "categorie";
  for (let n = 1; n <= 50; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

// ---------------------------------------------------------------------------

export async function createCategory(
  input: CategoryInput
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const errors = validateCategory(input);
  if (hasErrors(errors)) return { ok: false, errors };

  const supabase = await createServerSupabase();
  const slug = await uniqueCategorySlug(supabase, slugify(input.titleFr));

  const { data: last } = await supabase
    .from("categories")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("categories")
    .insert({
      slug,
      title_fr: input.titleFr.trim(),
      title_en: null,
      title_ar: null,
      subtitle_fr: nullIfBlank(input.subtitleFr),
      subtitle_en: null,
      subtitle_ar: null,
      position: last ? last.position + 1 : 0,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: `Enregistrement impossible : ${error.message}` };
  }

  revalidateMenu();
  return { ok: true, id: data.id };
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const errors = validateCategory(input);
  if (hasErrors(errors)) return { ok: false, errors };

  const supabase = await createServerSupabase();

  // The slug is intentionally NOT regenerated from the new title: it is the
  // #anchor the category nav scrolls to, and any QR code or link a customer
  // already has would break.
  const { error } = await supabase
    .from("categories")
    .update({
      title_fr: input.titleFr.trim(),
      subtitle_fr: nullIfBlank(input.subtitleFr),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, message: `Enregistrement impossible : ${error.message}` };
  }

  revalidateMenu();
  return { ok: true, id };
}

/**
 * Deletes a category AND every dish in it (the FK cascades).
 *
 * The cascade happens in Postgres, which knows nothing about Storage — so
 * the photos are collected first and removed by hand, otherwise every
 * deleted category would leak its images into the bucket forever.
 */
export async function deleteCategory(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const supabase = await createServerSupabase();

  const { data: dishes } = await supabase
    .from("dishes")
    .select("image_url")
    .eq("category_id", id);

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    return { ok: false, message: `Suppression impossible : ${error.message}` };
  }

  const paths = (dishes ?? [])
    .map((d) => storagePathFromUrl(d.image_url))
    .filter((p): p is string => p !== null);

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(MENU_IMAGES_BUCKET)
      .remove(paths);
    if (storageError) {
      console.error(
        "[admin] could not delete category images:",
        storageError.message
      );
    }
  }

  revalidateMenu();
  return { ok: true, id };
}

/** Swaps a category with its neighbour. See `moveDish` for why swapping
 * beats re-indexing. */
export async function moveCategory(
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return AUTH_ERROR;

  const supabase = await createServerSupabase();

  const { data: all, error } = await supabase
    .from("categories")
    .select("id, position");

  if (error) {
    return { ok: false, message: `Déplacement impossible : ${error.message}` };
  }

  const ordered = (all ?? []).sort((a, b) => a.position - b.position);
  const index = ordered.findIndex((c) => c.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || targetIndex < 0 || targetIndex >= ordered.length) {
    return { ok: true, id };
  }

  const current = ordered[index];
  const neighbour = ordered[targetIndex];

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase
      .from("categories")
      .update({ position: neighbour.position })
      .eq("id", current.id),
    supabase
      .from("categories")
      .update({ position: current.position })
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
