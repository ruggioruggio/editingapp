import { Dock } from "@/components/app/Dock";
import { Splash } from "@/components/app/Splash";
import { StatsBar } from "@/components/app/StatsBar";
import { Logo } from "@/components/brand/Logo";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh">
      <Splash />
      <header className="sticky top-0 z-30 border-b border-white/5 bg-app/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Logo href="/learn" size={28} />
          <StatsBar />
        </div>
      </header>
      <main className="pb-32">{children}</main>
      <Dock />
    </div>
  );
}
