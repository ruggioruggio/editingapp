"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authErrorMessage } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { FormMessage, NotConfigured, SubmitButton, fieldClass } from "./AuthShell";
import { OAuthButtons } from "./OAuthButtons";

export const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

/** Dopo la registrazione: link nell'email oppure codice a 6 cifre da digitare qui. */
function ConfirmCode({ email }: { email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = String(new FormData(e.currentTarget).get("code")).replace(/\s/g, "");
    setBusy(true);
    setError(null);
    const { error: err } = await getSupabase()!.auth.verifyOtp({ email, token, type: "email" });
    setBusy(false);
    if (err) return setError("Codice non valido o scaduto.");
    router.replace("/learn");
  };

  return (
    <div className="space-y-3">
      <FormMessage tone="info">
        Ti abbiamo mandato un&apos;email a {email}. Apri il link oppure scrivi qui il codice.
      </FormMessage>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="code"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Codice di conferma"
          maxLength={10}
          className={`${fieldClass} text-center font-mono text-xl tracking-[0.4em]`}
        />
        <SubmitButton busy={busy}>Conferma</SubmitButton>
      </form>
      {error && <FormMessage tone="error">{error}</FormMessage>}
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const sb = getSupabase();
  if (!sb) return <NotConfigured />;

  if (sentTo) return <ConfirmCode email={sentTo} />;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username")).trim().toLowerCase().replace(/^@/, "");
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    if (!USERNAME_RE.test(username)) return setError("Nome utente: 3–20 caratteri tra lettere, numeri, punto e _.");
    if (password.length < 8) return setError("La password deve avere almeno 8 caratteri.");

    setBusy(true);
    setError(null);
    const { data: available } = await sb.rpc("username_available", { name: username });
    if (available === false) {
      setBusy(false);
      return setError("Questo nome utente è già preso.");
    }

    const { data, error: err } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        // usato solo dal template predefinito di Supabase; quello di SqueakEdit punta a /auth/confirm
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/learn`,
      },
    });
    setBusy(false);
    if (err) return setError(authErrorMessage(err));
    // con la conferma email attiva non c'è ancora una sessione
    if (data.session) router.replace("/learn");
    else setSentTo(email);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="username" required placeholder="Nome utente" autoComplete="username" maxLength={20} className={fieldClass} />
        <input name="email" type="email" required placeholder="Email" autoComplete="email" className={fieldClass} />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password (almeno 8 caratteri)"
          autoComplete="new-password"
          className={fieldClass}
        />
        <SubmitButton busy={busy}>Crea account</SubmitButton>
      </form>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <OAuthButtons next="/learn" />
      <p className="pt-4 text-center text-sm text-ink-dim">
        Hai già un account?{" "}
        <Link href="/login" className="font-black text-pr hover:underline">
          Accedi
        </Link>
      </p>
      <p className="text-center text-xs text-ink-mute">
        I progressi fatti come ospite su questo dispositivo vengono salvati nel tuo nuovo account.
      </p>
    </div>
  );
}
