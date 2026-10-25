"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BookOpen, Crown, MessagesSquare, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Mascot } from "@/components/brand/Mascot";
import { brand } from "@/config/brand";

const NAV: { href: string; label: string; icon: LucideIcon; external?: boolean }[] = [
  { href: "/learn", label: "Impara", icon: BookOpen },
  { href: "/pricing", label: "Pro", icon: Crown },
  { href: brand.discordUrl, label: "Community", icon: MessagesSquare, external: true },
];

function NavLink({ item, compact }: { item: (typeof NAV)[number]; compact?: boolean }) {
  const pathname = usePathname();
  const active = !item.external && pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      className={clsx(
        "flex items-center rounded-xl transition-colors",
        compact ? "flex-col gap-0.5 px-3 py-1.5 text-[11px]" : "gap-3 px-3 py-2.5 text-sm font-semibold",
        active ? "bg-accent/15 text-accent" : "text-ink-dim hover:bg-panel-2 hover:text-ink",
      )}
    >
      <Icon size={compact ? 20 : 18} />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-panel p-4 md:flex">
      <div className="mb-8 px-2">
        <Logo href="/learn" />
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <a
        href={brand.discordUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-auto flex items-center gap-3 rounded-xl border border-line bg-panel-2 p-3 text-xs text-ink-dim hover:border-pr/50"
      >
        <Mascot size={36} className="shrink-0" />
        <span>
          <strong className="block text-ink">Unisciti al Discord</strong>
          Novità, feedback e sfide di montaggio.
        </span>
      </a>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line bg-panel/95 py-1.5 backdrop-blur md:hidden">
      {NAV.map((item) => (
        <NavLink key={item.href} item={item} compact />
      ))}
    </nav>
  );
}
