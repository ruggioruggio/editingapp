"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authErrorMessage, useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { FormMessage, NotConfigured, SubmitButton, fieldClass } from "./AuthShell";

export function ResetPasswordForm() {
  const router = useRouter();
  const status = useAuth((s) => s.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const sb = getSupabase();
  if (!sb) return <NotConfigured />;
  if (status === "loading") return <div className="h-40" />;

  const requestLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email")).trim();
    setBusy(true);
    setError(null);
    const { error: err } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    if (err) return setError(authErrorMessage(err));
    setInfo(`Se esiste un account per ${email}, riceverai un link per scegliere una nuova password.`);
  };

  const updatePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    if (password.length < 8) return setError("La password deve avere almeno 8 caratteri.");
    setBusy(true);
    setError(null);
    const { error: err } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(authErrorMessage(err));
    router.replace("/learn");
  };

  return (
    <div className="space-y-3">
      {status === "user" ? (
        <form onSubmit={updatePassword} className="space-y-3">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Nuova password"
            autoComplete="new-password"
            className={fieldClass}
          />
          <SubmitButton busy={busy}>Salva la password</SubmitButton>
        </form>
      ) : info ? null : (
        <form onSubmit={requestLink} className="space-y-3">
          <input name="email" type="email" required placeholder="Email" autoComplete="email" className={fieldClass} />
          <SubmitButton busy={busy}>Inviami il link</SubmitButton>
        </form>
      )}
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {info && <FormMessage tone="info">{info}</FormMessage>}
    </div>
  );
}
