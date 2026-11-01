"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormMessage, NotConfigured, SubmitButton, fieldClass } from "@/components/auth/AuthShell";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { ResendEmail } from "@/components/auth/ResendEmail";
import { authErrorMessage } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { safeNext } from "@/lib/supabase/config";
import { useSettings } from "@/lib/settings/store";
import { useT } from "@/lib/settings/i18n";

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [needConfirm, setNeedConfirm] = useState(params.get("error") === "auth");
  const [error, setError] = useState<string | null>(
    params.get("error") === "auth" ? t("linkExpired") : null,
  );

  const sb = getSupabase();
  if (!sb) return <NotConfigured />;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    let mail = String(form.get("login")).trim();
    if (!mail.includes("@")) {
      const handle = mail.replace(/^@/, "").toLowerCase();
      const { data, error: rpcErr } = await sb.rpc("email_for_username", { handle });
      if (rpcErr || !data) {
        setBusy(false);
        return setError(t("handleNotFound"));
      }
      mail = data as string;
    }
    setEmail(mail);
    const { error: err } = await sb.auth.signInWithPassword({ email: mail, password: String(form.get("password")) });
    setBusy(false);
    if (err) {
      setNeedConfirm(err.code === "email_not_confirmed");
      return setError(authErrorMessage(err));
    }
    useSettings.getState().set({ onboardingDone: true });
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      const { data: f } = await sb.auth.mfa.listFactors();
      const totp = f?.totp?.[0];
      if (totp) return setMfa(totp.id);
    }
    router.replace(next);
  };

  const [mfaState, setMfa] = useState<string | null>(null);

  if (mfaState)
    return (
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const code = String(new FormData(e.currentTarget).get("code")).replace(/\s/g, "");
          setBusy(true);
          const { error: err } = await sb.auth.mfa.challengeAndVerify({ factorId: mfaState, code });
          setBusy(false);
          if (err) return setError(t("invalidCode"));
          router.replace(next);
        }}
      >
        <FormMessage tone="info">{t("mfaPrompt")}</FormMessage>
        <input name="code" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" className={`${fieldClass} text-center font-mono text-xl tracking-[0.4em]`} />
        <SubmitButton busy={busy}>{t("verify")}</SubmitButton>
        {error && <FormMessage tone="error">{error}</FormMessage>}
      </form>
    );

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="login" type="text" required placeholder={t("emailOrUsername")} autoComplete="username" className={fieldClass} />
        <input
          name="password"
          type="password"
          required
          placeholder={t("password")}
          autoComplete="current-password"
          className={fieldClass}
        />
        <SubmitButton busy={busy}>{t("login")}</SubmitButton>
      </form>
      {error && <FormMessage tone="error">{error}</FormMessage>}
      {needConfirm && <ResendEmail email={email} askEmail={!email} />}
      <Link href="/reset-password" className="block text-center text-sm font-black uppercase text-pr hover:underline">
        {t("forgotPassword")}
      </Link>
      <OAuthButtons next={next} />
      <p className="pt-4 text-center text-sm text-ink-dim">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-black text-pr hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
