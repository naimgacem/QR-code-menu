"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/Button";
import { TextField } from "./ui/Field";
import {
  AlertIcon,
  ChevronLeftIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from "./icons";

/** Supabase returns English, technical strings. The owner sees French. */
function frenchAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "E-mail ou mot de passe incorrect.";
  if (m.includes("email not confirmed"))
    return "Cette adresse e-mail n'a pas encore été confirmée.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  if (m.includes("fetch") || m.includes("network"))
    return "Connexion impossible. Vérifiez votre connexion internet.";
  return "La connexion a échoué. Réessayez.";
}

/** Only ever bounce back to an in-app admin path. Without this check,
 * ?next=https://evil.example turns the login into an open redirect. */
function safeRedirect(next: string | null): string {
  if (!next) return "/admin";
  if (!next.startsWith("/admin")) return "/admin";
  if (next.startsWith("//")) return "/admin";
  return next;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(frenchAuthError(authError.message));
        setPending(false);
        return;
      }

      // refresh() re-runs middleware + the server layout so the new session
      // cookie is picked up; replace() keeps the login out of history.
      router.replace(safeRedirect(searchParams.get("next")));
      router.refresh();
    } catch {
      setError("Connexion impossible. Vérifiez votre connexion internet.");
      setPending(false);
    }
  }

  const detectCapsLock = (e: React.KeyboardEvent) =>
    setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          className="flex animate-admin-fade items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-3 text-[13.5px] leading-snug text-danger"
        >
          <AlertIcon className="mt-px h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <TextField
        label="Adresse e-mail"
        type="email"
        name="email"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="proprietaire@exemple.com"
        prefix={<MailIcon className="h-[18px] w-[18px]" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={pending}
        required
      />

      <div className="relative">
        <TextField
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          prefix={<LockIcon className="h-[18px] w-[18px]" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={detectCapsLock}
          onKeyDown={detectCapsLock}
          hint={capsLock ? "Attention : la touche Majuscule est activée." : undefined}
          disabled={pending}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={
            showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
          aria-pressed={showPassword}
          className="absolute end-1 top-[27px] grid h-10 w-10 touch-manipulation place-items-center rounded-lg text-subtle transition-colors hover:text-fg"
        >
          {showPassword ? (
            <EyeOffIcon className="h-[18px] w-[18px]" />
          ) : (
            <EyeIcon className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={pending}
        className="!mt-7"
        disabled={!email.trim() || !password}
      >
        {pending ? "Connexion…" : "Se connecter"}
      </Button>

      <p className="text-center text-[12.5px] leading-relaxed text-subtle">
        Mot de passe oublié&nbsp;? Contactez votre développeur — il peut le
        réinitialiser depuis Supabase.
      </p>

      <p className="border-t border-line-soft pt-5 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-muted transition-colors hover:text-fg"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Retour à la carte
        </Link>
      </p>
    </form>
  );
}
