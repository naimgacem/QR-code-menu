"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { CategoryRow, DishRow } from "@/lib/supabase/types";
import { OrnamentDivider } from "@/components/OrnamentDivider";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/admin/category-actions";
import { formatPrice } from "@/lib/admin/format";
import {
  LIMITS,
  hasErrors,
  validateCategory,
  type FieldErrors,
} from "@/lib/admin/validation";
import { DishThumb } from "./DishThumb";
import { Button, buttonClass } from "./ui/Button";
import { Card } from "./ui/Card";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { TextField } from "./ui/Field";
import { FormActionBar } from "./ui/FormActionBar";
import { isModalOpen } from "./ui/keyboard";
import { useToast } from "./ui/Toast";
import { InfoIcon, PlusIcon, TrashIcon } from "./icons";

type Props = {
  category?: CategoryRow;
  /** The category's dishes (edit mode) — listed alongside the form, and
   * counted in the delete warning, since they go with it. */
  dishes?: DishRow[];
};

const BACK = "/admin/categories";

export function CategoryForm({ category, dishes = [] }: Props) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(category);
  const dishCount = dishes.length;

  const [titleFr, setTitleFr] = useState(category?.title_fr ?? "");
  const [subtitleFr, setSubtitleFr] = useState(category?.subtitle_fr ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!dirty || saved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, saved]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!isModalOpen()) formRef.current?.requestSubmit();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending || (isEdit && !dirty)) return;

    const input = { titleFr, subtitleFr };
    const clientErrors = validateCategory(input);
    if (hasErrors(clientErrors)) {
      setErrors(clientErrors);
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, input)
        : await createCategory(input);

      if (!result.ok) {
        if (result.errors) setErrors(result.errors);
        if (result.message) toast.error(result.message);
        return;
      }

      setSaved(true);
      setDirty(false);
      toast.success(
        isEdit
          ? "Catégorie enregistrée."
          : `Catégorie « ${titleFr.trim()} » créée.`
      );
      router.push(BACK);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!category) return;
    setDeleting(true);
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (!result.ok) {
        setDeleting(false);
        setConfirmingDelete(false);
        toast.error(result.message ?? "La suppression a échoué.");
        return;
      }
      setSaved(true);
      toast.success(`« ${category.title_fr} » a été supprimée.`);
      router.push(BACK);
      router.refresh();
    });
  }

  function leave() {
    setSaved(true);
    router.push(BACK);
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="grid items-start grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5 lg:col-start-1">
            <Card title="Informations">
              <div className="space-y-5">
                <TextField
                  label="Nom de la catégorie"
                  value={titleFr}
                  onChange={(e) => {
                    setDirty(true);
                    setTitleFr(e.target.value);
                  }}
                  error={errors.titleFr}
                  maxLength={LIMITS.categoryTitle}
                  count={{
                    value: titleFr.trim().length,
                    max: LIMITS.categoryTitle,
                  }}
                  placeholder="Plats traditionnels"
                  disabled={isPending}
                  required
                />

                <TextField
                  label="Sous-titre"
                  optional
                  value={subtitleFr}
                  onChange={(e) => {
                    setDirty(true);
                    setSubtitleFr(e.target.value);
                  }}
                  error={errors.subtitleFr}
                  maxLength={LIMITS.subtitle}
                  count={{
                    value: subtitleFr.trim().length,
                    max: LIMITS.subtitle,
                  }}
                  placeholder="Servis au rez-de-chaussée"
                  hint="S'affiche en petites capitales au-dessus du titre."
                  disabled={isPending}
                />

                {isEdit && (
                  <p className="flex items-start gap-2 rounded-xl bg-surface-2/60 px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
                    <InfoIcon className="mt-px h-4 w-4 flex-shrink-0 text-subtle" />
                    <span>
                      Le lien de cette catégorie{" "}
                      <span className="font-medium text-fg">
                        #{category?.slug}
                      </span>{" "}
                      ne change pas quand vous la renommez — les liens déjà
                      partagés continuent de fonctionner.
                    </span>
                  </p>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-5 lg:sticky lg:top-10 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Card
              title="Aperçu"
              description="L'en-tête de la section sur la carte."
            >
              {/* Mirrors MenuSection's header, in the menu's own palette. */}
              <div className="menu-tokens rounded-xl bg-app px-4 py-7 text-center">
                {subtitleFr.trim() && (
                  <p className="text-[10px] uppercase tracking-[0.32em] text-accent-strong">
                    <span aria-hidden="true" className="me-2 text-accent/55">
                      ·
                    </span>
                    {subtitleFr.trim()}
                    <span aria-hidden="true" className="ms-2 text-accent/55">
                      ·
                    </span>
                  </p>
                )}
                <p className="mt-3 break-words font-display text-[30px] font-medium leading-[1.05] text-fg">
                  {titleFr.trim() || "Nom de la catégorie"}
                </p>
                <div className="mt-4 text-accent">
                  <OrnamentDivider />
                </div>
              </div>
            </Card>

            {isEdit && category && (
              <Card
                title="Plats"
                padding="none"
                action={
                  <Link
                    href={`/admin/dishes/new?category=${category.id}`}
                    className={buttonClass("secondary", "sm")}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Ajouter
                  </Link>
                }
              >
                {dishes.length === 0 ? (
                  <p className="px-5 pb-5 text-[13px] text-subtle">
                    Aucun plat dans cette catégorie.
                  </p>
                ) : (
                  <ul className="max-h-[360px] divide-y divide-line-soft overflow-y-auto border-t border-line-soft">
                    {dishes.map((dish) => (
                      <li key={dish.id}>
                        <Link
                          href={`/admin/dishes/${dish.id}`}
                          className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface-2/60"
                        >
                          <DishThumb
                            src={dish.image_url}
                            size="sm"
                            dimmed={!dish.is_available}
                          />
                          <span
                            className={`min-w-0 flex-1 truncate text-[13.5px] font-medium ${
                              dish.is_available ? "text-fg" : "text-subtle"
                            }`}
                          >
                            {dish.name_fr}
                          </span>
                          <span className="flex-shrink-0 text-[13px] font-semibold tabular-nums text-muted">
                            {formatPrice(dish.price)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>

          {isEdit && (
            // Last on phones (after the preview), under the main column on
            // desktop: a danger zone belongs at the end of the page.
            <div className="min-w-0 lg:col-start-1">
              <Card
                title="Supprimer cette catégorie"
                tone="danger"
                description={
                  dishCount > 0
                    ? `Ses ${dishCount} plat${dishCount > 1 ? "s" : ""} et leurs photos seront supprimés avec elle.`
                    : "Elle ne contient aucun plat."
                }
              >
                <Button
                  variant="danger-ghost"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={isPending}
                  icon={<TrashIcon className="h-4 w-4" />}
                  className="border border-danger/30"
                >
                  Supprimer la catégorie
                </Button>
              </Card>
            </div>
          )}
        </div>

        <FormActionBar
          dirty={dirty}
          pending={isPending && !deleting}
          requireDirty={isEdit}
          submitLabel={isEdit ? "Enregistrer" : "Créer la catégorie"}
          onCancel={() => (dirty ? setConfirmingLeave(true) : leave())}
        />
      </form>

      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer cette catégorie ?"
        message={
          dishCount > 0
            ? `« ${category?.title_fr ?? ""} » sera supprimée avec ses ${dishCount} plat${
                dishCount > 1 ? "s" : ""
              } et leurs photos. Cette action est irréversible.`
            : `« ${category?.title_fr ?? ""} » sera définitivement supprimée. Cette action est irréversible.`
        }
        confirmLabel={
          dishCount > 0
            ? `Supprimer (${dishCount} plat${dishCount > 1 ? "s" : ""})`
            : "Supprimer"
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />

      <ConfirmDialog
        open={confirmingLeave}
        title="Quitter sans enregistrer ?"
        message="Vos modifications de cette catégorie seront perdues."
        confirmLabel="Quitter"
        cancelLabel="Continuer"
        onConfirm={leave}
        onCancel={() => setConfirmingLeave(false)}
      />
    </>
  );
}
