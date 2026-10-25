import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { brand } from "@/config/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-app/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-5 text-sm font-bold">
          <Link href="/download" className="hidden text-ink-dim hover:text-ink sm:inline">
            Scarica l&apos;app
          </Link>
          <Link href="/pricing" className="hidden text-ink-dim hover:text-ink sm:inline">
            Pro
          </Link>
          <Link href="/login" className="btn-3d rounded-xl border-2 border-line bg-panel px-4 py-2 font-black uppercase text-pr">
            Accedi
          </Link>
        </nav>
      </div>
    </header>
  );
}

const FOOTER: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Chi siamo",
    links: [
      { label: "Il progetto", href: "/" },
      { label: "Prezzi e Pro", href: "/pricing" },
      { label: "Community Discord", href: brand.discordUrl },
    ],
  },
  {
    title: "Prodotti",
    links: [
      { label: brand.appName, href: "/learn" },
      { label: brand.aiName, href: "/pricing" },
      { label: "App desktop", href: "/download" },
    ],
  },
  {
    title: "App",
    links: [
      { label: "iPhone e iPad", href: "/download" },
      { label: "Android", href: "/download" },
      { label: "Windows e Mac", href: "/download" },
    ],
  },
  {
    title: "Aiuto",
    links: [
      { label: "Accedi", href: "/login" },
      { label: "Feedback su Discord", href: brand.discordUrl },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-pr text-pr-deep">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        {FOOTER.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-lg font-black">{col.title}</h3>
            <ul className="space-y-2 text-sm font-bold opacity-80">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:opacity-100 hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-pr-deep/15 py-6 text-center text-xs font-bold opacity-70">
        © {new Date().getFullYear()} {brand.appName}. Non affiliato ad Adobe. Premiere Pro e After Effects sono marchi di Adobe
        Inc.
      </p>
    </footer>
  );
}
