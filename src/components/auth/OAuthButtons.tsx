"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { authErrorMessage } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { FormMessage } from "./AuthShell";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "apple", label: "Apple" },
];

/** Accesso con Google/Apple: vanno attivati in Supabase → Authentication → Providers. */
export function OAuthButtons({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);

  const signIn = async (provider: Provider) => {
    const sb = getSupabase();
    if (!sb) return;
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: err } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (err) setError(authErrorMessage(err));
  };

  return (
    <div className="space-y-3">
      <div className="my-6 flex items-center gap-3 text-xs font-black text-ink-mute">
        <span className="h-px flex-1 bg-line" /> OPPURE <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => signIn(p.id)}
            className="btn-3d rounded-2xl border-2 border-line bg-panel py-3 font-black uppercase text-ink"
          >
            {p.label}
          </button>
        ))}
      </div>
      {error && <FormMessage tone="error">{error}</FormMessage>}
    </div>
  );
}
