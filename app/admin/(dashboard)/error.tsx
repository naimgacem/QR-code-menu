"use client";

import { useEffect } from "react";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AlertIcon, ResetIcon } from "@/components/admin/icons";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="pt-6">
      <EmptyState
        tone="danger"
        icon={<AlertIcon className="h-6 w-6" />}
        title="Une erreur est survenue"
        action={
          <Button onClick={reset} icon={<ResetIcon className="h-4 w-4" />}>
            Réessayer
          </Button>
        }
      >
        {/* The action layer already phrases its failures in French; anything
         * else is a real fault and gets a generic line rather than a stack. */}
        {error.message.startsWith("Impossible de charger")
          ? error.message
          : "La connexion à la base de données a échoué. Vérifiez votre connexion internet, puis réessayez."}
      </EmptyState>
    </div>
  );
}
