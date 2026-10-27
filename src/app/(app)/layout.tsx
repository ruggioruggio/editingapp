import { AccountMenu } from "@/components/app/AccountMenu";
import { Dock } from "@/components/app/Dock";
import { Onboarding } from "@/components/app/Onboarding";
import { Splash } from "@/components/app/Splash";
import { AnnouncementBar, BanGate } from "@/components/app/SiteNotices";
import { StatsBar } from "@/components/app/StatsBar";
import { Logo } from "@/components/brand/Logo";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh">
      <Onboarding />
      <Splash />
      <BanGate />
      <AnnouncementBar />
      <header className="sticky top-0 z-30 border-b border-white/5 bg-app/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Logo href="/learn" size={30} compact />
          <div className="flex items-center gap-3 sm:gap-4">
            <StatsBar />
            <AccountMenu />
          </div>
        </div>
      </header>
      <main className="pb-36">{children}</main>
      <Dock />
    </div>
  );
}
