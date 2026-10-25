import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { getLesson, lessons } from "@/content/lessons";

type Props = { params: Promise<{ lessonId: string }> };

export function generateStaticParams() {
  return Object.keys(lessons).map((lessonId) => ({ lessonId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  return { title: getLesson(lessonId)?.title ?? "Lezione" };
}

export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  if (!getLesson(lessonId)) notFound();
  return <LessonPlayer lessonId={lessonId} />;
}
