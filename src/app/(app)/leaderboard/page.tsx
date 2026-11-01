import type { Metadata } from "next";
import { WorldLeaderboard } from "@/components/leaderboard/WorldLeaderboard";

export const metadata: Metadata = { title: "Classifica" };

export default function LeaderboardPage() {
  return <WorldLeaderboard />;
}
