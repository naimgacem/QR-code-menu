"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MENU_IMAGES_BUCKET } from "@/lib/supabase/types";
import { dishImagePath, storagePathFromUrl } from "@/lib/admin/storage";
import {
  ImageEditor,
  type CroppedImage,
  type EditorState,
} from "./ImageEditor";
import { Button, Spinner } from "./ui/Button";
import {
  CameraIcon,
  ImageIcon,
  SlidersIcon,
  TrashIcon,
  UploadIcon,
} from "./icons";

export type ImageValue = {
  url: string;
  width: number | null;
  height: number | null;
  /** blob: URL of a photo edited in this session. Displayed instead of
   * `url` so nothing flickers while the uploaded copy loads. Never saved. */
  localUrl?: string;
};

/** Phone photos are large, but 25 MB is a RAW/burst artefact, not a dish
 * photo — decoding it would just hang the tab. */
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

type Props = {
  value: ImageValue | null;
  /** Used to name the stored object, so the bucket stays browsable. */
  slug: string;
  onChange: (value: ImageValue | null) => void;
  /** Reports an upload in flight, so the form can hold its save until the
   * new photo's URL exists — otherwise it would save the old one. */
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
};

export function ImageUploader({
  value,
  slug,
  onChange,
  onBusyChange,
  disabled,
}: Props) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<{
    source: Blob;
    initialState?: EditorState;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  /** Downloading a saved photo so it can be re-edited. */
  const [opening, setOpening] = useState(false);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Objects this form uploaded but has not yet committed to a dish row.
   * Replacing a photo before saving deletes the previous upload so a few
   * rounds of re-editing don't each leave a file behind. */
  const uncommitted = useRef<string[]>([]);
  /** The full-resolution original behind the current photo, and how it was
   * edited. "Retoucher" reopens the editor on it — not on the 1200×900
   * result, which would lose detail with every round. */
  const original = useRef<{ file: Blob; state: EditorState } | null>(null);
  const blobUrls = useRef<string[]>([]);

  useEffect(() => {
    onBusyChange?.(uploading);
  }, [uploading, onBusyChange]);

  useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function accept(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choisissez un fichier image (JPG, PNG, HEIC…).");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("Cette image est trop lourde. Choisissez une photo plus légère.");
      return;
    }
    setError(null);
    setEditing({ source: file });
  }

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset immediately so re-picking the SAME file still fires onChange.
    e.target.value = "";
    accept(file);
  }

  async function retouch() {
    if (original.current) {
      setEditing({
        source: original.current.file,
        initialState: original.current.state,
      });
      return;
    }
    if (!value) return;

    // A photo saved in an earlier session: fetch it back and edit that.
    setOpening(true);
    setError(null);
    try {
      const response = await fetch(value.url);
      if (!response.ok) throw new Error(String(response.status));
      setEditing({ source: await response.blob() });
    } catch {
      setError(
        "Impossible d'ouvrir cette photo pour la retoucher. Remplacez-la par une nouvelle."
      );
    } finally {
      setOpening(false);
    }
  }

  async function upload(image: CroppedImage, state: EditorState, source: Blob) {
    const preview = URL.createObjectURL(image.blob);
    blobUrls.current.push(preview);
    setPendingPreview(preview);
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const path = dishImagePath(slug, image.extension);

      const { error: uploadError } = await supabase.storage
        .from(MENU_IMAGES_BUCKET)
        .upload(path, image.blob, {
          contentType: "image/jpeg",
          // Immutable: the filename already carries a unique suffix, so a
          // replaced photo is a new URL rather than a cache bust.
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) {
        setError(`Envoi impossible : ${uploadError.message}`);
        return;
      }

      const previous = uncommitted.current.pop();
      if (previous) {
        await supabase.storage.from(MENU_IMAGES_BUCKET).remove([previous]);
      }
      uncommitted.current.push(path);

      const {
        data: { publicUrl },
      } = supabase.storage.from(MENU_IMAGES_BUCKET).getPublicUrl(path);

      original.current = { file: source, state };
      onChange({
        url: publicUrl,
        width: image.width,
        height: image.height,
        localUrl: preview,
      });
    } catch {
      setError("Envoi impossible. Vérifiez votre connexion internet.");
    } finally {
      setUploading(false);
      setPendingPreview(null);
    }
  }

  async function removePhoto() {
    const path = storagePathFromUrl(value?.url);
    // Only clean up files this form uploaded. An image still referenced by
    // the saved dish row is removed by the server action on save, and repo
    // files under /images/menu must never be touched.
    if (path && uncommitted.current.includes(path)) {
      uncommitted.current = uncommitted.current.filter((p) => p !== path);
      try {
        await createClient().storage.from(MENU_IMAGES_BUCKET).remove([path]);
      } catch {
        // Non-fatal: the row is what matters, and it no longer points here.
      }
    }
    original.current = null;
    onChange(null);
  }

  const busy = uploading || opening || Boolean(disabled);
  const shown = pendingPreview ?? value?.localUrl ?? value?.url ?? null;

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      if (busy || !e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      setDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!busy) accept(e.dataTransfer.files?.[0]);
    },
  };

  return (
    <div {...dropHandlers}>
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={pick}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      {/* A second input with `capture`: goes straight to the camera on a
       * phone instead of asking "photo library or camera?". */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={pick}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {shown ? (
        <div>
          <div
            className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-2 ring-inset transition-shadow ${
              dragging ? "ring-2 ring-accent" : "ring-1 ring-line-soft"
            }`}
          >
            <Image
              src={shown}
              alt="Photo du plat"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />

            {uploading && (
              <div className="absolute inset-0 grid animate-admin-fade place-items-center bg-app/45 backdrop-blur-[1px]">
                <span className="flex items-center gap-2 rounded-full bg-surface-overlay px-3.5 py-1.5 text-[12.5px] font-medium text-fg shadow-admin-md">
                  <Spinner className="h-3.5 w-3.5" />
                  Envoi de la photo…
                </span>
                <span className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-surface/40">
                  <span className="block h-full w-2/5 animate-indeterminate rounded-full bg-accent" />
                </span>
              </div>
            )}

            {dragging && (
              <div className="absolute inset-0 grid place-items-center bg-app/60 text-[14px] font-semibold text-fg backdrop-blur-[2px]">
                Déposez pour remplacer la photo
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<SlidersIcon className="h-4 w-4" />}
              onClick={retouch}
              loading={opening}
              disabled={busy}
            >
              Retoucher
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<UploadIcon className="h-4 w-4" />}
              onClick={() => galleryRef.current?.click()}
              disabled={busy}
            >
              Remplacer
            </Button>
            <Button
              variant="danger-ghost"
              size="sm"
              icon={<TrashIcon className="h-4 w-4" />}
              onClick={removePhoto}
              disabled={busy}
              aria-label="Retirer la photo"
              className="ms-auto"
            >
              <span className="hidden sm:inline">Retirer</span>
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 text-center transition-colors sm:aspect-auto sm:min-h-[280px] ${
            dragging
              ? "border-accent bg-accent-soft/50"
              : "border-line bg-surface-2/40"
          }`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-accent-strong shadow-admin-sm ring-1 ring-line-soft">
            <ImageIcon className="h-6 w-6" />
          </span>
          <p className="mt-3 text-[14.5px] font-semibold text-fg">
            {dragging ? "Déposez la photo ici" : "Ajoutez une photo du plat"}
          </p>
          <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-subtle">
            Vous pourrez la recadrer, la redresser et ajuster ses couleurs
            avant de l&apos;enregistrer.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {/* Camera shortcut only where there is a camera to point:
             * hidden on mouse-driven desktops. */}
            <Button
              size="sm"
              icon={<CameraIcon className="h-4 w-4" />}
              onClick={() => cameraRef.current?.click()}
              disabled={busy}
              className="[@media(hover:hover)_and_(pointer:fine)]:hidden"
            >
              Prendre une photo
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<UploadIcon className="h-4 w-4" />}
              onClick={() => galleryRef.current?.click()}
              disabled={busy}
            >
              Choisir une image
            </Button>
          </div>
          <p className="mt-3 hidden text-[12px] text-subtle [@media(hover:hover)_and_(pointer:fine)]:block">
            ou glissez-déposez un fichier ici
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2.5 rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] leading-snug text-danger"
        >
          {error}
        </p>
      )}

      {editing && (
        <ImageEditor
          source={editing.source}
          initialState={editing.initialState}
          onCancel={() => setEditing(null)}
          onDone={({ image, state }) => {
            const source = editing.source;
            setEditing(null);
            void upload(image, state, source);
          }}
        />
      )}
    </div>
  );
}
