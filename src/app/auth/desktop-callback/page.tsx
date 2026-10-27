"use client";

import { useEffect } from "react";

export default function DesktopCallback() {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        window.location.href = `squeakedit://auth/callback?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`;
        return;
      }
    }
    window.location.href = "squeakedit://auth/callback?error=no_token";
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-lg font-bold text-ink-mute">Login in corso... torna all&apos;app.</p>
    </div>
  );
}
