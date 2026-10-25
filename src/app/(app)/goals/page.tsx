import type { Metadata } from "next";
import { GoalsGrid } from "@/components/goals/GoalsGrid";

export const metadata: Metadata = { title: "Obiettivi" };

export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-black">Obiettivi</h1>
      <p className="mb-6 text-sm text-ink-dim">Sbloccane il più possibile: ogni obiettivo ha più livelli.</p>
      <GoalsGrid />
    </div>
  );
}
