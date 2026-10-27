"use client";

import { useEffect, useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { authErrorMessage } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";
import { FormMessage } from "./AuthShell";

const IS_ELECTRON = typeof navigator !== "undefined" && /Electron/i.test(navigator.userAgent);

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
  </svg>
);

/** Faccina del controller di Discord (stessa forma del logo 3D del sito). */
const DiscordLogo = () => (
  <svg width="22" height="22" viewBox="30 50 196 170" aria-hidden>
    <path
      fill="#5865F2"
      fillRule="evenodd"
      d="M60 88 Q128 60 196 88 Q222 140 214 186 Q196 200 172 204 L160 184 Q128 194 96 184 L84 204 Q60 200 42 186 Q34 140 60 88 Z M83 146 a17 20 0 1 0 34 0 a17 20 0 1 0 -34 0 Z M139 146 a17 20 0 1 0 34 0 a17 20 0 1 0 -34 0 Z"
    />
  </svg>
);

const LOGOS: Record<string, () => React.ReactElement> = { google: GoogleLogo, discord: DiscordLogo };

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "discord", label: "Discord" },
];

/** Accesso con Google/Discord: vanno attivati in Supabase → Authentication → Providers. */
export function OAuthButtons({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!IS_ELECTRON) return;
    const handler = async (e: Event) => {
      const hash = (e as CustomEvent).detail as string;
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        const sb = getSupabase();
        if (sb) {
          const { error: err } = await sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (!err) router.replace(next || "/learn");
        }
      }
    };
    window.addEventListener("squeakedit-oauth", handler);
    return () => window.removeEventListener("squeakedit-oauth", handler);
  }, [router, next]);

  const signIn = async (provider: Provider) => {
    const sb = getSupabase();
    if (!sb) return;
    if (IS_ELECTRON) {
      const { data, error: err } = await sb.auth.signInWithOAuth({ provider, options: { skipBrowserRedirect: true } });
      if (err) { setError(authErrorMessage(err)); return; }
      if (data.url) {
        const w = window as unknown as { squeakDesktop?: { openOAuth: (url: string) => void } };
        if (w.squeakDesktop?.openOAuth) {
          w.squeakDesktop.openOAuth(data.url);
        } else {
          window.open(data.url);
        }
      }
    } else {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: err } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo } });
      if (err) setError(authErrorMessage(err));
    }
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
            <span className="flex items-center justify-center gap-2">
              {LOGOS[p.id]?.()}
              {p.label}
            </span>
          </button>
        ))}
      </div>
      {error && <FormMessage tone="error">{error}</FormMessage>}
    </div>
  );
}
