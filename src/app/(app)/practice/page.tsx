import type { Metadata } from "next";
import Link from "next/link";
import { Clapperboard, Monitor, Sparkles } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { PhoneNotice } from "@/components/studio/PhoneNotice";

export const metadata: Metadata = { title: "Pratica" };

const STUDIOS = [
  {
    href: "/studio/premiere",
    name: "Premiere Pro",
    short: "Pr",
    color: "#9999ff",
    bg: "#00005b",
    icon: Clapperboard,
    text: "Timeline con più tracce, monitor sorgente e programma, controlli effetti, transizioni, nuova sequenza ed esportazione.",
  },
  {
    href: "/studio/after-effects",
    name: "After Effects",
    short: "Ae",
    color: "#d291ff",
    bg: "#00005b",
    icon: Sparkles,
    text: "Composizione, livelli di testo e forma, proprietà di trasformazione con keyframe, Easy Ease e anteprima dell'animazione.",
  },
];

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-black">Pratica</h1>
      <p className="mb-8 text-ink-dim">
        Un simulatore che funziona come i programmi veri: stessi pannelli, stessi strumenti, stesse scorciatoie. Esercitati
        liberamente, senza rischi.
      </p>
      <PhoneNotice />
      <div className="grid gap-4 sm:grid-cols-2">
        {STUDIOS.map(({ href, name, short, color, bg, icon: Icon, text }) => (
          <Link key={href} href={href} className="duo-card group flex flex-col gap-4 p-5 hover:bg-panel-2">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-xl border-2 text-2xl font-black" style={{ background: bg, borderColor: color, color }}>
                {short}
              </span>
              <div>
                <p className="text-xl font-black">{name}</p>
                <p className="flex items-center gap-1 text-xs font-bold text-ink-mute">
                  <Icon size={13} /> Simulatore
                </p>
              </div>
            </div>
            <p className="text-sm text-ink-dim">{text}</p>
            <span className="duo-btn duo-blue mt-auto w-full">Apri</span>
          </Link>
        ))}
      </div>
      <div className="duo-card mt-6 flex items-center gap-4 p-4">
        <Mascot size={60} idle className="shrink-0" />
        <p className="flex items-start gap-2 text-sm text-ink-dim">
          <Monitor size={18} className="mt-0.5 shrink-0 text-accent" />
          Funziona anche dal telefono, ma con mouse e tastiera ti sembrerà di essere davvero in Premiere: prova le scorciatoie
          V, C, B, Spazio, Ctrl+K, Ctrl+Z.
        </p>
      </div>
    </div>
  );
}
