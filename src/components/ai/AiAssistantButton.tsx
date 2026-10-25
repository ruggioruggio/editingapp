import Link from "next/link";
import { Sparkles } from "lucide-react";
import { brand } from "@/config/brand";

/** Dalla lezione apre Squeak AI sapendo su quale lezione sei. */
export function AiAssistantButton({ lessonId }: { lessonId?: string }) {
  return (
    <Link
      href={lessonId ? `/ai?lesson=${encodeURIComponent(lessonId)}` : "/ai"}
      className="flex items-center gap-1.5 rounded-full border border-pr/40 bg-pr/10 px-3 py-1.5 text-xs font-semibold text-pr hover:bg-pr/20"
    >
      <Sparkles size={14} />
      <span className="hidden sm:inline">{brand.aiName}</span>
    </Link>
  );
}
