import { MobileNav, Sidebar } from "@/components/app/AppNav";
import { StatsBar } from "@/components/app/StatsBar";
import { Logo } from "@/components/brand/Logo";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-line bg-app/90 px-4 backdrop-blur">
          <div className="md:hidden">
            <Logo href="/learn" />
          </div>
          <div className="ml-auto">
            <StatsBar />
          </div>
        </header>
        <main className="flex-1 pb-24 md:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
