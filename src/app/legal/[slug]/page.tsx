import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocView } from "@/components/legal/LegalDocView";
import { getLegalDoc, PUBLISHED_LEGAL_DOCS as LEGAL_DOCS } from "@/content/legal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = getLegalDoc((await params).slug);
  return { title: doc?.title ?? "Documenti legali", description: doc?.summary };
}

export default async function LegalPage({ params }: Props) {
  const doc = getLegalDoc((await params).slug);
  if (!doc) notFound();
  return <LegalDocView doc={doc} />;
}
