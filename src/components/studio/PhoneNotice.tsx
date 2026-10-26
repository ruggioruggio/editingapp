"use client";

import { Monitor } from "lucide-react";
import { useIsPhone } from "@/lib/hooks/useIsPhone";

/** Avviso nella scheda Pratica quando la si apre dal telefono. */
export function PhoneNotice() {
  const phone = useIsPhone();
  if (!phone) return null;
  return (
    <div className="duo-card mb-5 flex items-start gap-3 border-cheese/50 p-4 text-sm">
      <Monitor size={20} className="mt-0.5 shrink-0 text-cheese" />
      <p>
        <span className="font-black text-cheese">Disponibile solo nella versione desktop.</span> I simulatori completi di Premiere Pro e After Effects si usano dal computer. Dal telefono puoi esercitarti negli esercizi dentro le lezioni.
      </p>
    </div>
  );
}
