import type { Metadata } from "next";
import { LearnPath } from "@/components/learn/LearnPath";
import { allLessons, sections } from "@/content/course";

export const metadata: Metadata = { title: "Il tuo percorso" };

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-black">Il tuo percorso</h1>
      <p className="mb-8 text-sm text-ink-dim">
        {sections.length} sezioni, {allLessons.length} lezioni da 3 minuti: dal primo taglio al progetto finale.
      </p>
      <LearnPath />
    </div>
  );
}
