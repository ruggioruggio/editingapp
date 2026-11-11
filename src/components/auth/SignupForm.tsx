"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildConsents, savePendingConsents } from "@/lib/account/consents";
import { useCookieConsent } from "@/lib/settings/cookieConsent";
import { authErrorMessage } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { FormMessage, NotConfigured, SubmitButton, fieldClass } from "./AuthShell";
import { OAuthButtons } from "./OAuthButtons";
import { ResendEmail } from "./ResendEmail";

export const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
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
      <ResendEmail email={email} />
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // every box starts unticked: consent must be an explicit action (GDPR art. 4.11 and 7)
  const [agree, setAgree] = useState({ terms: false, privacy: false, cookies: false, marketing: false });
  const [consentError, setConsentError] = useState(false);
  const requiredOk = agree.terms && agree.privacy && agree.cookies;

  const sb = getSupabase();
  if (!sb) return <NotConfigured />;

  if (sentTo) return <ConfirmCode email={sentTo} />;

  const requireConsents = () => {
    setConsentError(!requiredOk);
    if (requiredOk) savePendingConsents(buildConsents(agree.marketing));
    return requiredOk;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requireConsents()) return;
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
        data: { username, consents: buildConsents(agree.marketing) },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/learn`,
      },
    });
    setBusy(false);
    if (err) return setError(authErrorMessage(err));
    useCookieConsent.getState().choose("accepted");
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
        <fieldset className="space-y-2 pt-1">
          <legend className="sr-only">Consensi</legend>
          <ConsentBox checked={agree.terms} onChange={(v) => setAgree({ ...agree, terms: v })}>
            Ho almeno 14 anni e accetto i <DocLink href="/legal/termini">Termini di servizio</DocLink> e le{" "}
            <DocLink href="/legal/community">Regole della community</DocLink> <Req />
          </ConsentBox>
          <ConsentBox checked={agree.privacy} onChange={(v) => setAgree({ ...agree, privacy: v })}>
            Ho letto l&apos;<DocLink href="/legal/privacy">Informativa privacy</DocLink> <Req />
          </ConsentBox>
          <ConsentBox checked={agree.cookies} onChange={(v) => setAgree({ ...agree, cookies: v })}>
            Accetto i <DocLink href="/legal/cookie">cookie tecnici</DocLink>, necessari per restare collegato <Req />
          </ConsentBox>
          <ConsentBox checked={agree.marketing} onChange={(v) => setAgree({ ...agree, marketing: v })}>
            Voglio ricevere email con novità e consigli (facoltativo, puoi cambiare idea nelle impostazioni)
          </ConsentBox>
        </fieldset>
        <SubmitButton busy={busy}>Crea account</SubmitButton>
      </form>
      {consentError && !requiredOk && <FormMessage tone="error">Per creare un account devi spuntare le caselle obbligatorie (*).</FormMessage>}
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <OAuthButtons next="/learn" canProceed={requireConsents} />
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

function ConsentBox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-left text-sm text-ink-dim">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-success)]" />
      <span>{children}</span>
    </label>
  );
}

function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} target="_blank" className="font-bold text-ink underline">
      {children}
    </Link>
  );
}

const Req = () => <span className="font-black text-danger" aria-label="obbligatorio">*</span>;
