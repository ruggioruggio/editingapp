import { redirect } from "next/navigation";

// Gli obiettivi ora stanno nella stessa pagina delle quest.
export default function GoalsPage() {
  redirect("/quests?tab=obiettivi");
}
