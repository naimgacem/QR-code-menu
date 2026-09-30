"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { CategoryRow, DishRow } from "@/lib/supabase/types";
import type { MenuItem } from "@/lib/menu-data";
import { formatPrice, slugify } from "@/lib/admin/format";
import {
  createDish,
  deleteDish,
  updateDish,
} from "@/lib/admin/dish-actions";
import {
  LIMITS,
  validateDish,
  hasErrors,
  type FieldErrors,
} from "@/lib/admin/validation";
import { DishPreview } from "./DishPreview";
import { ImageUploader, type ImageValue } from "./ImageUploader";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { PageHeader, type PageHeaderProps } from "./ui/PageHeader";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { SelectField, TextAreaField, TextField } from "./ui/Field";
import { FormActionBar } from "./ui/FormActionBar";
import { isModalOpen } from "./ui/keyboard";
import { Switch } from "./ui/Switch";
import { useToast } from "./ui/Toast";
import { TrashIcon } from "./icons";

type Props = {
  /** Title, back link… The form adds the delete button in edit mode. */
  headerProps: Omit<PageHeaderProps, "action">;
  /** Absent in create mode. */
  dish?: DishRow;
  categories: CategoryRow[];
  /** Preselected category in create mode ("Ajouter ici" on the list). */
  initialCategoryId?: string | null;
};

/** Digits only — the schema stores whole dinars, and a numeric keypad on a
 * phone can still emit separators, spaces and pasted currency symbols. */
const digitsOnly = (value: string) => value.replace(/[^\d]/g, "");

const BACK = "/admin/dishes";

export function DishForm({
  headerProps,
  dish,
  categories,
  initialCategoryId,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(dish);

  const [nameFr, setNameFr] = useState(dish?.name_fr ?? "");
  const [categoryId, setCategoryId] = useState(
    dish?.category_id ??
      (initialCategoryId && categories.some((c) => c.id === initialCategoryId)
        ? initialCategoryId
        : categories[0]?.id ?? "")
  );
  const [price, setPrice] = useState(dish ? String(dish.price) : "");
  const [descriptionFr, setDescriptionFr] = useState(
    dish?.description_fr ?? ""
  );
  const [isAvailable, setIsAvailable] = useState(dish?.is_available ?? true);
  const [image, setImage] = useState<ImageValue | null>(
    dish?.image_url
      ? {
          url: dish.image_url,
          width: dish.image_width,
          height: dish.image_height,
        }
      : null
  );

  const [errors, setErrors] = useState<FieldErrors>({});
  const [photoBusy, setPhotoBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  /** Set just before navigating away on a successful save, so the unload
   * guard doesn't fire on the redirect we asked for. */
  const [saved, setSaved] = useState(false);

  // Warns on tab close / reload. In-app navigation is not intercepted — the
  // App Router has no supported hook for it — but Annuler asks first.
  useEffect(() => {
    if (!dirty || saved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, saved]);

  // Ctrl/⌘ + S saves, as in every desktop editor.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        // Not from under the photo editor or a dialog.
        if (!isModalOpen()) formRef.current?.requestSubmit();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const track =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setDirty(true);
      setter(value);
    };

  function buildInput() {
    return {
      categoryId,
      nameFr,
      descriptionFr,
      price: price === "" ? Number.NaN : Number(price),
      imageUrl: image?.url ?? null,
      imageWidth: image?.width ?? null,
      imageHeight: image?.height ?? null,
      isAvailable,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending || photoBusy) return;
    if (isEdit && !dirty) return;

    const input = buildInput();
    const clientErrors = validateDish(input);
    if (hasErrors(clientErrors)) {
      setErrors(clientErrors);
      // Bring the first problem into view and put the cursor in it.
      const first = document.querySelector<HTMLElement>(
        `[data-field="${Object.keys(clientErrors)[0]}"]`
      );
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first
        ?.querySelector<HTMLElement>("input, textarea, select")
        ?.focus({ preventScroll: true });
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = dish
        ? await updateDish(dish.id, input)
        : await createDish(input);

      if (!result.ok) {
        if (result.errors) setErrors(result.errors);
        if (result.message) toast.error(result.message);
        return;
      }

      setSaved(true);
      setDirty(false);
      toast.success(
        isEdit ? "Modifications enregistrées." : `« ${nameFr.trim()} » ajouté à la carte.`
      );
      router.push(BACK);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!dish) return;
    setDeleting(true);
    startTransition(async () => {
      const result = await deleteDish(dish.id);
      if (!result.ok) {
        setDeleting(false);
        setConfirmingDelete(false);
        toast.error(result.message ?? "La suppression a échoué.");
        return;
      }
      setSaved(true);
      setDirty(false);
      toast.success(`« ${dish.name_fr} » a été supprimé.`);
      router.push(BACK);
      router.refresh();
    });
  }

  function leave() {
    setSaved(true);
    router.push(BACK);
  }

  const priceNumber = price === "" ? null : Number(price);
  const priceChanged =
    isEdit && dish && priceNumber !== null && priceNumber !== dish.price;

  const header = (
    <PageHeader
      {...headerProps}
      action={
        isEdit ? (
          // Up here, not only at the bottom of the form: the owner looks
          // for "delete" next to the title, as in most iPhone apps.
          <Button
            variant="danger-ghost"
            onClick={() => setConfirmingDelete(true)}
            disabled={isPending}
            icon={<TrashIcon className="h-[18px] w-[18px]" />}
            aria-label="Supprimer"
            className="border border-danger/30 px-3 sm:px-4"
          >
            <span className="hidden sm:inline">Supprimer</span>
          </Button>
        ) : undefined
      }
    />
  );

  const previewItem: MenuItem = {
    // Not a real slug, so the preview can never share state with an
    // item in the owner's own order.
    id: "admin-apercu",
    name: { fr: nameFr.trim() || "Nom du plat" },
    price: priceNumber ?? 0,
    description: descriptionFr.trim() ? { fr: descriptionFr.trim() } : undefined,
    image: image ? image.localUrl ?? image.url : undefined,
    width: image?.width ?? undefined,
    height: image?.height ?? undefined,
  };

  return (
    <>
      {header}
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="grid items-start grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5 lg:col-start-1">
            <Card
              title="Photo"
              description="Lumière du jour, plat bien centré, vue légèrement en plongée : les clients commandent avec les yeux."
            >
              <ImageUploader
                value={image}
                // On create there is no slug yet, so the filename is derived
                // from whatever has been typed. slugify() returns "" for "".
                slug={dish?.slug || slugify(nameFr) || "plat"}
                onChange={track(setImage)}
                onBusyChange={setPhotoBusy}
                disabled={isPending}
              />
            </Card>

            <Card title="Informations">
              <div className="space-y-5">
                <div data-field="nameFr">
                  <TextField
                    label="Nom du plat"
                    value={nameFr}
                    onChange={(e) => track(setNameFr)(e.target.value)}
                    error={errors.nameFr}
                    maxLength={LIMITS.name}
                    count={{ value: nameFr.trim().length, max: LIMITS.name }}
                    placeholder="Couscous royal"
                    disabled={isPending}
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div data-field="categoryId">
                    <SelectField
                      label="Catégorie"
                      value={categoryId}
                      onChange={track(setCategoryId)}
                      error={errors.categoryId}
                      disabled={isPending}
                      required
                      options={categories.map((c) => ({
                        value: c.id,
                        label: c.title_fr,
                      }))}
                    />
                  </div>

                  <div data-field="price">
                    <TextField
                      label="Prix"
                      // Not type="number": on iOS it still shows the full
                      // keyboard for some locales, and the scroll wheel
                      // silently changes the value on desktop.
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={price}
                      onChange={(e) =>
                        track(setPrice)(digitsOnly(e.target.value).slice(0, 7))
                      }
                      error={errors.price}
                      suffix="DA"
                      placeholder="1500"
                      hint={
                        priceChanged && dish
                          ? `Avant : ${formatPrice(dish.price)} DA`
                          : "En dinars, sans centimes."
                      }
                      disabled={isPending}
                      required
                    />
                  </div>
                </div>

                <div data-field="descriptionFr">
                  <TextAreaField
                    label="Description"
                    optional
                    value={descriptionFr}
                    onChange={(e) => track(setDescriptionFr)(e.target.value)}
                    error={errors.descriptionFr}
                    rows={3}
                    maxLength={LIMITS.description}
                    count={{
                      value: descriptionFr.trim().length,
                      max: LIMITS.description,
                    }}
                    placeholder="Semoule fine, légumes de saison, agneau et merguez."
                    hint="Une phrase courte suffit : ingrédients, portion, accompagnement."
                    disabled={isPending}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-5 lg:sticky lg:top-10 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Card title="Visibilité">
              <Switch
                checked={isAvailable}
                onChange={track(setIsAvailable)}
                label="Visible sur la carte"
                description={
                  isAvailable
                    ? "Les clients voient ce plat."
                    : "Masqué — idéal pour un plat épuisé."
                }
                disabled={isPending}
              />
            </Card>

            <Card
              title="Aperçu"
              description="Tel que vos clients le verront sur la carte."
            >
              <DishPreview item={previewItem} hidden={!isAvailable} />
            </Card>
          </div>

          {isEdit && (
            // Last on phones (after the preview), under the main column on
            // desktop: a danger zone belongs at the end of the page.
            <div className="min-w-0 lg:col-start-1">
              <Card
                title="Supprimer ce plat"
                tone="danger"
                description="Le plat et sa photo disparaîtront définitivement. Pour un plat épuisé ce soir, masquez-le plutôt."
              >
                <Button
                  variant="danger-ghost"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={isPending}
                  icon={<TrashIcon className="h-4 w-4" />}
                  className="border border-danger/30"
                >
                  Supprimer le plat
                </Button>
              </Card>
            </div>
          )}
        </div>

        <FormActionBar
          dirty={dirty}
          pending={isPending && !deleting}
          requireDirty={isEdit}
          blockedReason={photoBusy ? "Envoi de la photo en cours…" : null}
          submitLabel={
            photoBusy
              ? "Envoi de la photo…"
              : isEdit
                ? "Enregistrer"
                : "Ajouter le plat"
          }
          onCancel={() => (dirty ? setConfirmingLeave(true) : leave())}
        />
      </form>

      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer ce plat ?"
        message={`« ${dish?.name_fr ?? ""} » disparaîtra définitivement de la carte, avec sa photo. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />

      <ConfirmDialog
        open={confirmingLeave}
        title="Quitter sans enregistrer ?"
        message="Vos modifications de ce plat seront perdues."
        confirmLabel="Quitter"
        cancelLabel="Continuer"
        onConfirm={leave}
        onCancel={() => setConfirmingLeave(false)}
      />
    </>
  );
}
