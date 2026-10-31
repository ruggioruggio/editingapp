import { redirect } from "next/navigation";

export default function GoalsPage() {
  redirect("/quests?tab=obiettivi");
}
