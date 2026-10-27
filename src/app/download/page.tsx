import type { Metadata } from "next";
import { Apple, Download, Monitor, Smartphone } from "lucide-react";
import { RunScene } from "@/components/brand/scenes";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { StoreButtons } from "@/components/site/StoreButtons";
import { brand } from "@/config/brand";
import { DOWNLOADS } from "@/config/downloads";

export const metadata: Metadata = { title: "Scarica l'app" };

function DownloadLink({ href, title, note, primary }: { href: string; title: string; note: string; primary?: boolean }) {
  return (
    <a href={href} className={primary ? "duo-btn w-full justify-start gap-3 text-left" : "duo-btn duo-ghost w-full justify-start gap-3 text-left"}>
      <Download size={20} className="shrink-0" />
      <span className="leading-tight">
        <span className="block">{title}</span>
        <span className="block text-[11px] font-bold normal-case opacity-75">{note}</span>
      </span>
    </a>
  );
}

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
          Installa l&apos;app sul computer o sul telefono, come qualsiasi altro programma. Oppure usa {brand.appName} direttamente dal browser.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          <section className="rounded-3xl border border-line bg-panel p-6">
            <Monitor size={32} className="mb-3 text-pr" />
            <h2 className="mb-1 text-2xl font-black">Windows</h2>
            <p className="mb-5 text-ink-dim">Il posto migliore per i simulatori: schermo grande, mouse e tastiera.</p>
            <div className="space-y-3">
              <DownloadLink primary href={DOWNLOADS.windowsSetup} title="Installa per Windows" note="Programma di installazione (.exe)" />
            </div>
            <p className="mt-4 text-xs text-ink-mute">Se Windows mostra &quot;PC protetto&quot;: Ulteriori informazioni → Esegui comunque.</p>
          </section>

          <section className="rounded-3xl border border-line bg-panel p-6">
            <Apple size={32} className="mb-3 text-ink" />
            <h2 className="mb-1 text-2xl font-black">Mac</h2>
            <p className="mb-5 text-ink-dim">Apri il file .dmg e trascina {brand.appName} nella cartella Applicazioni.</p>
            <div className="space-y-3">
              <DownloadLink primary href={DOWNLOADS.macArm} title="Mac con chip Apple" note="M1, M2, M3, M4 (.dmg)" />
              <DownloadLink href={DOWNLOADS.macIntel} title="Mac con Intel" note="Modelli più vecchi (.dmg)" />
            </div>
            <p className="mt-4 text-xs text-ink-mute">La prima volta: clic destro sull&apos;app → Apri.</p>
          </section>

          <section className="rounded-3xl border border-line bg-panel p-6">
            <Smartphone size={32} className="mb-3 text-cheese" />
            <h2 className="mb-1 text-2xl font-black">Android</h2>
            <p className="mb-5 text-ink-dim">Teoria, quiz, quest ed esercizi anche in metro.</p>
            <div className="space-y-3">
              <StoreButtons className="[&>*:first-child]:hidden [&>a:last-child]:hidden" />
              <DownloadLink primary href={DOWNLOADS.android} title="Scarica l'APK demo" note="Installazione diretta, senza Play Store" />
            </div>
            <p className="mt-4 text-xs text-ink-mute">Sul telefono consenti l&apos;installazione da &quot;origini sconosciute&quot; quando te lo chiede.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
