import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { Markdown } from "@/components/ai/Markdown";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { getLegalDoc, LEGAL_UPDATED, PUBLISHED_LEGAL_DOCS as LEGAL_DOCS } from "@/content/legal";

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

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-[220px_1fr]">
        <nav aria-label="Documenti legali" className="flex gap-2 overflow-x-auto md:flex-col">
          {LEGAL_DOCS.map((d) => (
            <Link
              key={d.slug}
              href={`/legal/${d.slug}`}
              className={clsx(
                "shrink-0 rounded-xl px-3 py-2 text-sm font-bold",
                d.slug === doc.slug ? "bg-pr/15 text-pr" : "text-ink-dim hover:bg-panel-2 hover:text-ink",
              )}
            >
              {d.title}
            </Link>
          ))}
        </nav>
        <article className="min-w-0">
          <h1 className="mb-2 text-3xl font-black md:text-4xl">{doc.title}</h1>
          <p className="mb-8 text-sm text-ink-mute">Ultimo aggiornamento: {LEGAL_UPDATED}</p>
          <div className="text-ink-dim [&_p.font-black]:mt-6 [&_p.font-black]:text-lg">
            <Markdown text={doc.body} />
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
