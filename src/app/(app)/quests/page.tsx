import { Suspense } from "react";
import type { Metadata } from "next";
import { QuestsAndGoals } from "@/components/quests/QuestsAndGoals";

export const metadata: Metadata = { title: "Quest e obiettivi" };

export default function QuestsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-black">Quest e obiettivi</h1>
      <Suspense>
        <QuestsAndGoals />
      </Suspense>
    </div>
  );
}
