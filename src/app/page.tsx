import Link from "next/link";
import { Clapperboard, MessagesSquare, Scissors, Sparkles, Timer } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Mascot } from "@/components/brand/Mascot";
import { brand } from "@/config/brand";
import { course } from "@/content/course";

const FEATURES = [
  { icon: Timer, title: "Lezioni da 3 minuti", text: "Una pillola alla volta, dal primo taglio ai keyframe." },
  { icon: Scissors, title: "Pratica vera", text: "Esercizi in un editor nel browser che si usa come Premiere Pro." },
  { icon: Clapperboard, title: "Teoria da professionisti", text: "Sequenze, timecode, Rec.709, keyframe: spiegati semplice." },
  { icon: Sparkles, title: brand.aiName, text: "Un assistente che guarda la tua timeline e ti sblocca (Pro)." },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/pricing" className="hidden text-ink-dim hover:text-ink sm:inline">
            Prezzi
          </Link>
          <a href={brand.discordUrl} target="_blank" rel="noreferrer" className="hidden text-ink-dim hover:text-ink sm:inline">
            Community
          </a>
          <Link href="/learn" className="rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:brightness-110">
            Inizia gratis
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 inline-block rounded-full border border-pr/40 bg-pr/10 px-3 py-1 text-xs font-semibold text-pr">
            Il modo divertente di imparare il montaggio
          </p>
          <h1 className="mb-5 text-4xl font-extrabold leading-tight md:text-6xl">
            Impara a montare video, <span className="text-cheese">3 minuti</span> al giorno.
          </h1>
          <p className="mb-8 max-w-lg text-lg text-ink-dim">
            Tagli, transizioni, color correction e motion graphics con micro-lezioni e esercizi pratici in un editor
            ispirato a Premiere Pro. Direttamente dal browser, anche da telefono.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/learn" className="btn-3d rounded-xl bg-success px-7 py-3.5 font-bold uppercase text-[#08311f]">
              Inizia la prima lezione
            </Link>
            <Link href="/pricing" className="rounded-xl border border-line px-7 py-3.5 font-bold uppercase text-ink-dim hover:text-ink">
              Vedi i piani
            </Link>
          </div>
        </div>
        <HeroEditorMock />
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-line bg-panel p-5">
            <Icon size={22} className="mb-3 text-pr" />
            <h3 className="mb-1 font-bold">{title}</h3>
            <p className="text-sm text-ink-dim">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-8 text-center text-3xl font-extrabold">Dal primo taglio alla motion graphics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {course.map((unit, i) => (
            <div key={unit.id} className="rounded-2xl border p-5" style={{ borderColor: `${unit.color}55` }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: unit.color }}>
                Unità {i + 1}
              </p>
              <h3 className="mb-3 text-lg font-bold">{unit.title}</h3>
              <ul className="space-y-1.5 text-sm text-ink-dim">
                {unit.lessons.map((l) => (
                  <li key={l.id}>• {l.title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-pr/40 bg-linear-to-br from-pr/15 to-panel p-8 text-center md:flex-row md:text-left">
          <Mascot size={96} mood="wow" className="shrink-0" />
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-extrabold">Entra nella community</h2>
            <p className="text-ink-dim">
              Sul nostro Discord trovi aggiornamenti, sfide di montaggio settimanali e puoi dirci cosa vuoi imparare.
            </p>
          </div>
          <a
            href={brand.discordUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-3d flex items-center gap-2 rounded-xl bg-[#5865f2] px-6 py-3 font-bold text-white"
          >
            <MessagesSquare size={18} /> Unisciti al Discord
          </a>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-ink-mute">
        © {new Date().getFullYear()} {brand.appName}. Non affiliato ad Adobe. Premiere Pro e After Effects sono marchi di
        Adobe Inc.
      </footer>
    </div>
  );
}

/** Anteprima statica dell'editor per la hero. */
function HeroEditorMock() {
  return (
    <div className="relative">
      <div className="rounded-xl border border-line bg-[#0f0f0f] p-2 shadow-2xl">
        <div className="mb-2 aspect-video rounded-md bg-linear-to-br from-[#2b4a7a] to-[#0d1526]" />
        <div className="rounded-md border border-line bg-panel p-2">
          <div className="relative mb-1.5 h-9 rounded-sm bg-[#191919]">
            <div className="absolute inset-y-1 left-[2%] w-[38%] rounded-sm border border-[#a49df7] bg-vclip" />
            <div className="absolute inset-y-1 left-[41%] w-[24%] rounded-sm border border-[#a49df7] bg-vclip" />
            <div className="absolute inset-y-1 left-[66%] w-[30%] rounded-sm border border-[#a49df7] bg-vclip" />
          </div>
          <div className="relative h-7 rounded-sm bg-[#191919]">
            <div className="absolute inset-y-1 left-[2%] w-[38%] rounded-sm border border-[#5ccf8d] bg-aclip" />
            <div className="absolute inset-y-1 left-[41%] w-[24%] rounded-sm border border-[#5ccf8d] bg-aclip" />
            <div className="absolute inset-y-1 left-[66%] w-[30%] rounded-sm border border-[#5ccf8d] bg-aclip" />
          </div>
        </div>
      </div>
      <Mascot size={110} className="absolute -bottom-10 -left-6 drop-shadow-2xl" />
    </div>
  );
}
