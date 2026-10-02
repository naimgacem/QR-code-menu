import { Suspense } from "react";
import { ArchPattern } from "@/components/ArchPattern";
import { BrandMark } from "@/components/admin/BrandMark";
import { LoginForm } from "@/components/admin/LoginForm";
import { CheckIcon } from "@/components/admin/icons";

const POINTS = [
  "Prix, photos et plats modifiés en direct sur la carte",
  "Un plat épuisé ? Masquez-le d'un geste",
  "Depuis votre téléphone comme depuis un ordinateur",
];

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ---- brand panel (desktop) — always the dark evening palette ---- */}
      <aside
        data-theme="dark"
        className="relative hidden overflow-hidden border-e border-line-soft bg-surface text-fg lg:flex lg:flex-col lg:justify-between lg:p-12"
      >
        {/* The menu's arch motif, fading out before it reaches the text. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 aspect-square text-accent [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        >
          <ArchPattern className="h-full w-full" opacity={0.12} />
        </div>
        <div
          aria-hidden="true"
          className="absolute -end-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-muted">
            Espace propriétaire
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-wordmark text-[56px] font-bold leading-[1] text-fg">
            Dar El Baraka
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Votre carte, à jour en quelques secondes.
          </p>
          <ul className="mt-9 space-y-3.5">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[14.5px] text-fg">
                <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-accent-soft text-accent-strong">
                  <CheckIcon className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[12.5px] text-subtle">Casbah · Alger</p>
      </aside>

      {/* ---- form ---- */}
      <div className="flex flex-col justify-center px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-[400px]">
          <header className="mb-8">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandMark className="h-11 w-11" />
              <div>
                <p className="font-wordmark text-[26px] font-bold leading-none text-fg">
                  Dar El Baraka
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
                  Espace propriétaire
                </p>
              </div>
            </div>
            <h2 className="mt-8 text-[26px] font-semibold tracking-[-0.02em] text-fg lg:mt-0">
              Connexion
            </h2>
            <p className="mt-1.5 text-[14px] text-muted">
              Accédez à la gestion de votre carte.
            </p>
          </header>

          {/* LoginForm reads ?next= via useSearchParams. */}
          <Suspense fallback={<div className="h-[320px]" aria-hidden="true" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
