import type { Metadata } from "next";
import { QuestBoard } from "@/components/quests/QuestBoard";

export const metadata: Metadata = { title: "Quest" };

export default function QuestsPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-black">Quest</h1>
      <QuestBoard />
    </div>
  );
}
