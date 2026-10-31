import type { Metadata } from "next";
import { LearnPath } from "@/components/learn/LearnPath";
import { allLessons, sections } from "@/content/course";

export const metadata: Metadata = { title: "Il tuo percorso" };

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <LearnPath />
    </div>
  );
}
