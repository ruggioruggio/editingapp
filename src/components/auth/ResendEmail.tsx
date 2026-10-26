"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { fieldClass } from "./AuthShell";

/**
 * "Rimanda l'email": se il link è scaduto o l'email non è arrivata in tempo,
 * ne manda un'altra (al massimo una al minuto, come chiede Supabase).
 */
export function ResendEmail({ email: initial = "", askEmail = false }: { email?: string; askEmail?: boolean }) {
  const [email, setEmail] = useState(initial);
  const [wait, setWait] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => setEmail(initial), [initial]);
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async () => {
    const sb = getSupabase();
    if (!sb || !email) return;
    setMsg(null);
    const { error } = await sb.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/learn` } });
    if (error) {
      const m = /(\d+) seconds?/.exec(error.message);
      if (m) setWait(Number(m[1]));
      setMsg(m ? "Aspetta qualche secondo prima di chiederne un'altra." : "Non sono riuscito a mandare l'email. Controlla l'indirizzo.");
      return;
    }
    setWait(60);
    setMsg(`Nuova email inviata a ${email}: usa il link o il codice più recente.`);
  };

  return (
    <div className="space-y-2 rounded-2xl border border-line bg-panel/60 p-3">
      <p className="text-sm text-ink-dim">Il link è scaduto o l&apos;email non è arrivata?</p>
      {askEmail && <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="La tua email" className={fieldClass} />}
      <button type="button" disabled={wait > 0 || !email} onClick={send} className="duo-btn duo-ghost w-full disabled:opacity-50">
        {wait > 0 ? `Rimanda l'email tra ${wait}s` : "Rimanda l'email di conferma"}
      </button>
      {msg && <p className="text-xs font-bold text-ink-mute">{msg}</p>}
    </div>
  );
}
