import type { Metadata } from "next";
import { FriendsPanel } from "@/components/friends/FriendsPanel";

export const metadata: Metadata = { title: "Amici" };

export default function FriendsPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-black">Amici</h1>
      <FriendsPanel />
    </div>
  );
}
