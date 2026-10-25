import type { Metadata } from "next";
import { Monitor, Smartphone } from "lucide-react";
import { RunScene } from "@/components/brand/scenes";
import { InstallButton } from "@/components/site/InstallButton";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { StoreButtons } from "@/components/site/StoreButtons";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Scarica l'app" };

export default function DownloadPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mx-auto mb-12 max-w-md">
          <RunScene />
        </div>
        <h1 className="mb-3 text-center text-4xl font-black md:text-5xl">Scarica {brand.appName}</h1>
        <p className="mx-auto mb-12 max-w-xl text-center text-lg text-ink-dim">
          Un unico account su telefono, tablet e computer. Oppure usa {brand.appName} direttamente dal browser.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-3xl border border-line bg-panel p-6">
            <Monitor size={32} className="mb-3 text-pr" />
            <h2 className="mb-1 text-2xl font-black">Windows e Mac</h2>
            <p className="mb-5 text-ink-dim">
              L&apos;app desktop è il posto migliore per gli esercizi nell&apos;editor: schermo grande, mouse e tastiera.
            </p>
            <InstallButton />
          </section>
          <section className="rounded-3xl border border-line bg-panel p-6">
            <Smartphone size={32} className="mb-3 text-cheese" />
            <h2 className="mb-1 text-2xl font-black">iPhone e Android</h2>
            <p className="mb-5 text-ink-dim">
              Teoria, quiz e quest anche in metro. Le app per gli store sono in preparazione.
            </p>
            <StoreButtons className="[&>a:last-child]:hidden" />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
