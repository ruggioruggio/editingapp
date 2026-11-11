"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { applyPendingConsents, buildConsents } from "@/lib/account/consents";
import { useAuth } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Accounts created through Google/Discord from the login page, or before consents were recorded,
 * have no proof of consent: ask once, with the same separate unticked boxes as the sign-up form.
 */
export function ConsentCheck() {
  const status = useAuth((s) => s.status);
  const userId = useAuth((s) => s.userId);
  const [missing, setMissing] = useState(false);
  const [agree, setAgree] = useState({ terms: false, privacy: false, cookies: false, marketing: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (status !== "user" || !sb) return setMissing(false);
    let alive = true;
    void (async () => {
      const { data: first } = await sb.auth.getUser();
      if (first.user) await applyPendingConsents(sb, first.user);
      const { data } = await sb.auth.getUser();
      if (alive) setMissing(!!data.user && !(data.user.user_metadata as { consents?: unknown }).consents);
    })();
    return () => {
      alive = false;
    };
  }, [status, userId]);

  if (!missing) return null;
  const ok = agree.terms && agree.privacy && agree.cookies;

  const save = async () => {
    const sb = getSupabase();
    if (!sb || !ok) return setError(true);
    setBusy(true);
    const { error: err } = await sb.auth.updateUser({ data: { consents: buildConsents(agree.marketing) } });
    setBusy(false);
    if (err) return setError(true);
    setMissing(false);
  };

  const box = (key: keyof typeof agree, label: React.ReactNode) => (
    <label className="flex cursor-pointer items-start gap-2.5 text-left text-sm text-ink-dim">
      <input type="checkbox" checked={agree[key]} onChange={(e) => setAgree({ ...agree, [key]: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-success)]" />
      <span>{label}</span>
    </label>
  );
  const doc = (href: string, text: string) => (
    <Link href={href} target="_blank" className="font-bold text-ink underline">
      {text}
    </Link>
  );

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="fixed inset-0 z-[150] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="animate-pop w-full max-w-md rounded-3xl border-2 border-line bg-app p-6 shadow-2xl">
        <ShieldCheck size={36} className="text-success" />
        <h2 id="consent-title" className="mt-3 text-xl font-black">Prima di continuare</h2>
        <p className="mt-1 text-sm text-ink-dim">Ci servono alcune conferme per il tuo account.</p>
        <div className="mt-4 space-y-2.5">
          {box("terms", <>Ho almeno 14 anni e accetto i {doc("/legal/termini", "Termini di servizio")} e le {doc("/legal/community", "Regole della community")} <b className="text-danger">*</b></>)}
          {box("privacy", <>Ho letto l&apos;{doc("/legal/privacy", "Informativa privacy")} <b className="text-danger">*</b></>)}
          {box("cookies", <>Accetto i {doc("/legal/cookie", "cookie tecnici")}, necessari per restare collegato <b className="text-danger">*</b></>)}
          {box("marketing", "Voglio ricevere email con novità e consigli (facoltativo)")}
        </div>
        {error && !ok && <p className="mt-3 text-sm font-semibold text-danger">Spunta le caselle obbligatorie (*) per continuare.</p>}
        <button type="button" disabled={busy} onClick={save} className="btn-3d mt-5 w-full rounded-2xl bg-success py-3 font-black uppercase text-[#08311f] disabled:opacity-60">
          Continua
        </button>
      </div>
    </div>
  );
}
