"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormMessage, NotConfigured, SubmitButton, fieldClass } from "@/components/auth/AuthShell";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { authErrorMessage } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { safeNext } from "@/lib/supabase/config";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "auth" ? "Il link non è valido o è scaduto. Riprova ad accedere." : null,
  );

  const sb = getSupabase();
  if (!sb) return <NotConfigured />;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const { error: err } = await sb.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });
    setBusy(false);
    if (err) return setError(authErrorMessage(err));
    router.replace(next);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="email" type="email" required placeholder="Email" autoComplete="email" className={fieldClass} />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          autoComplete="current-password"
          className={fieldClass}
        />
        <SubmitButton busy={busy}>Accedi</SubmitButton>
      </form>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <Link href="/reset-password" className="block text-center text-sm font-black uppercase text-pr hover:underline">
        Password dimenticata?
      </Link>
      <OAuthButtons next={next} />
      <p className="pt-4 text-center text-sm text-ink-dim">
        Non hai un account?{" "}
        <Link href="/signup" className="font-black text-pr hover:underline">
          Registrati
        </Link>
      </p>
    </div>
  );
}
