import Link from "next/link";
import { Crown } from "lucide-react";
import { AccountMenu } from "@/components/app/AccountMenu";
import { Dock } from "@/components/app/Dock";
import { Splash } from "@/components/app/Splash";
import { StatsBar } from "@/components/app/StatsBar";
import { Logo } from "@/components/brand/Logo";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh">
      <Splash />
      <header className="sticky top-0 z-30 border-b border-white/5 bg-app/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Logo href="/learn" size={30} compact />
          <div className="flex items-center gap-3 sm:gap-4">
            <StatsBar />
            <Link
              href="/pricing"
              aria-label="SqueakEdit Pro"
              className="flex items-center gap-1 rounded-full bg-linear-to-r from-cheese to-[#ff9a5c] px-2.5 py-1 text-xs font-black text-[#3a2500] shadow-[0_2px_12px_rgb(255_201_60/0.35)] hover:brightness-110"
            >
              <Crown size={14} /> <span className="hidden sm:inline">PRO</span>
            </Link>
            <AccountMenu />
          </div>
        </div>
      </header>
      <main className="pb-36">{children}</main>
      <Dock />
    </div>
  );
}
