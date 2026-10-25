import type { Metadata } from "next";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { sections } from "@/content/course";

type Props = { params: Promise<{ unitId: string }> };

// Una pagina per ogni unità che ha già tutte le lezioni (si può "saltare" lì).
export function generateStaticParams() {
  return sections
    .flatMap((s) => s.units)
    .filter((u) => u.lessons.every((l) => l.status === "available"))
    .map((u) => ({ unitId: u.id }));
}

export const metadata: Metadata = { title: "Test di salto" };

export default async function UnitTestPage({ params }: Props) {
  const { unitId } = await params;
  return <LessonPlayer unitTestId={unitId} />;
}
