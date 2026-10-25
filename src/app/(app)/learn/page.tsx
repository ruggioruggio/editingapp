import type { Metadata } from "next";
import { LearnPath } from "@/components/learn/LearnPath";

export const metadata: Metadata = { title: "Il tuo percorso" };

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-extrabold">Il tuo percorso</h1>
      <p className="mb-10 text-sm text-ink-dim">Una lezione da 3 minuti alla volta: dal primo taglio alla motion graphics.</p>
      <LearnPath />
    </div>
  );
}
