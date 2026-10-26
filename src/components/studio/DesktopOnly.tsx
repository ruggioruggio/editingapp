"use client";

import Link from "next/link";
import { Monitor } from "lucide-react";
import { SiteScene } from "@/components/three/lazy";

/** Schermata mostrata dal telefono al posto dei simulatori completi. */
export function DesktopOnly({ app }: { app: string }) {
  return (
    <div className="fixed inset-0 grid place-items-center bg-app p-6 text-center">
      <div className="max-w-sm space-y-4">
        {/* Squeak arrabbiato in 3D: dal telefono il simulatore non si apre! */}
        <div className="mx-auto h-60 w-full max-w-xs">
          <SiteScene name="angry" className="h-full w-full" />
        </div>
        <h1 className="text-2xl font-black">{app} è disponibile solo nella versione desktop</h1>
        <p className="text-ink-dim">
          Il simulatore completo ha bisogno di uno schermo grande, mouse e tastiera. Aprilo dal computer (o da un tablet). Gli esercizi nelle lezioni invece funzionano anche da qui.
        </p>
        <p className="flex items-center justify-center gap-2 text-sm font-bold text-ink-mute">
          <Monitor size={16} /> Versione desktop
        </p>
        <Link href="/learn" className="duo-btn duo-blue w-full">
          Torna alle lezioni
        </Link>
      </div>
    </div>
  );
}
