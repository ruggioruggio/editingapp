"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * UI di accesso. Gli account (Supabase Auth: email, Google, Apple) non sono
 * ancora collegati: per ora ogni strada porta all'app come ospite e i dati
 * del form non vengono salvati né inviati da nessuna parte.
 */
export function LoginForm() {
  const router = useRouter();
  const [notice, setNotice] = useState(false);

  const enterAsGuest = (e?: FormEvent) => {
    e?.preventDefault();
    setNotice(true);
    setTimeout(() => router.push("/learn"), 900);
  };

  const field = "w-full rounded-2xl border-2 border-line bg-panel-2 px-4 py-3.5 font-semibold outline-none focus:border-pr";

  return (
    <div className="w-full">
      <form onSubmit={enterAsGuest} className="space-y-3">
        <input type="email" placeholder="Email o nome utente" autoComplete="username" className={field} />
        <input type="password" placeholder="Password" autoComplete="current-password" className={field} />
        <button type="submit" className="btn-3d w-full rounded-2xl bg-accent py-3.5 font-black uppercase tracking-wide text-white">
          Accedi
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-black text-ink-mute">
        <span className="h-px flex-1 bg-line" /> OPPURE <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {["Google", "Apple"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => enterAsGuest()}
            className="btn-3d rounded-2xl border-2 border-line bg-panel py-3 font-black uppercase text-ink"
          >
            {p}
          </button>
        ))}
      </div>

      {notice && (
        <p className="animate-pop mt-5 rounded-2xl border border-cheese/30 bg-cheese/10 p-3 text-center text-sm font-semibold text-cheese">
          Gli account arrivano presto: intanto entri come ospite e i progressi restano su questo dispositivo.
        </p>
      )}
    </div>
  );
}
