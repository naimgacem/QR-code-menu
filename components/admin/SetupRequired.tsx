import { BrandMark } from "./BrandMark";

const steps = [
  {
    title: "Créer un projet Supabase",
    detail: "supabase.com → New project. L'offre gratuite suffit largement.",
  },
  {
    title: "Créer les tables",
    detail:
      "Copier le contenu de supabase/schema.sql dans SQL Editor → Run.",
  },
  {
    title: "Renseigner les clés",
    detail:
      "Copier .env.local.example vers .env.local, puis coller l'URL du projet et la clé « anon » (Project Settings → API).",
  },
  {
    title: "Importer le menu actuel",
    detail: "npm run seed — transfère les plats de data/menu.json.",
  },
  {
    title: "Créer le compte du propriétaire",
    detail:
      "Authentication → Users → Add user. C'est l'identifiant de connexion à cet espace.",
  },
];

/**
 * Shown instead of the dashboard when the Supabase env vars are missing —
 * the one state where the admin genuinely cannot function. Guides through
 * setup rather than throwing.
 */
export function SetupRequired() {
  return (
    <div className="min-h-screen bg-app px-5 py-14 sm:px-6">
      <div className="mx-auto max-w-lg">
        <BrandMark className="h-11 w-11" />
        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-accent-strong">
          Configuration requise
        </p>
        <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg">
          L&apos;espace propriétaire n&apos;est pas encore connecté
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          La carte reste en ligne et fonctionne normalement — elle utilise la
          sauvegarde locale. Il reste ces étapes pour activer les modifications
          en ligne&nbsp;:
        </p>

        <ol className="mt-8 space-y-5 rounded-2xl border border-line-soft bg-surface p-5 shadow-admin-xs">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent-strong"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[14.5px] font-medium leading-snug text-fg">
                  {step.title}
                </p>
                <p className="mt-1 break-words text-[13px] leading-relaxed text-subtle">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-5 rounded-xl bg-surface-2/60 px-4 py-3.5 text-[13px] leading-relaxed text-muted">
          Le détail complet, avec captures d&apos;écran des réglages, se trouve
          dans <span className="font-medium text-fg">ADMIN-SETUP.md</span> à la
          racine du projet.
        </p>
      </div>
    </div>
  );
}
