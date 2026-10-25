import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";
import {
  ArrowLeftToLine,
  AudioLines,
  Clapperboard,
  Crown,
  Diamond,
  Film,
  Flame,
  Hammer,
  MessagesSquare,
  Palette,
  Scissors,
  Sparkles,
  Trophy,
  Type,
  Upload,
  Zap,
} from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { SiteScene } from "@/components/three/lazy";
import { HeroArt } from "@/components/site/HeroArt";
import { Reveal } from "@/components/site/Reveal";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { StoreButtons } from "@/components/site/StoreButtons";
import { brand } from "@/config/brand";
import { COMING_SOON, features } from "@/config/features";
import { allLessons, sections } from "@/content/course";

const TOPICS = [
  { label: "Tagli", icon: Scissors },
  { label: "Transizioni", icon: Film },
  { label: "Audio", icon: AudioLines },
  { label: "Rec.709", icon: Palette },
  { label: "Keyframe", icon: Diamond },
  { label: "Titoli", icon: Type },
  { label: "Motion", icon: Sparkles },
  { label: "Ripple delete", icon: ArrowLeftToLine },
  { label: "Ciak", icon: Clapperboard },
  { label: "Export", icon: Upload },
];

function PrimaryCta({ className }: { className?: string }) {
  return (
    <Link href="/learn" className={clsx("duo-btn w-full py-4", className)}>
      Inizia ora
    </Link>
  );
}

function FeatureRow({ title, text, art, flip }: { title: string; text: ReactNode; art: ReactNode; flip?: boolean }) {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-20 md:py-24">
      <Reveal className={clsx(flip && "md:order-2")}>
        <h2 className="mb-4 text-4xl font-black leading-tight text-pr md:text-5xl">{title}</h2>
        <div className="text-lg leading-relaxed text-ink-dim">{text}</div>
      </Reveal>
      <Reveal delay={150} className={clsx("mx-auto w-full max-w-md", flip && "md:order-1")}>
        {art}
      </Reveal>
    </section>
  );
}

function BadgeCloud() {
  const badges = [
    { icon: Flame, label: "Serie 7 giorni", color: "#ff8a3d" },
    { icon: Zap, label: "+20 XP", color: "#ffc93c" },
    { icon: Trophy, label: "Lama affilata", color: "#9999ff" },
  ];
  return (
    <div className="relative">
      <SiteScene name="cheese" className="aspect-[5/4] w-full" />
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {badges.map(({ icon: Icon, label, color }, i) => (
          <span
            key={label}
            className="float-y flex items-center gap-1.5 rounded-full border border-white/10 bg-panel-2 px-3 py-1.5 text-sm font-black"
            style={{ color, animationDelay: `${i * 0.5}s` }}
          >
            <Icon size={16} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-6 pb-12 pt-8 md:grid-cols-2 md:gap-16 md:pb-20 md:pt-16">
        <HeroArt />
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-8 text-3xl font-black leading-tight md:text-4xl">
            Il modo gratuito, divertente ed efficace per imparare il <span className="text-cheese">montaggio video</span>!
          </h1>
          <div className="space-y-3">
            <PrimaryCta />
            <Link href="/login" className="duo-btn duo-ghost w-full" style={{ ["--ink" as string]: "var(--color-pr)" }}>
              Ho già un account
            </Link>
          </div>
        </div>
      </section>

      {/* Nastro degli argomenti */}
      <div className="overflow-hidden border-y border-line bg-panel py-4">
        <div className="marquee flex w-max gap-10">
          {[...TOPICS, ...TOPICS].map(({ label, icon: Icon }, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-black uppercase tracking-widest text-ink-mute">
              <Icon size={18} className="text-pr" /> {label}
            </span>
          ))}
        </div>
      </div>

      <FeatureRow
        title="gratis. divertente. efficace."
        text={
          <>
            Lezioni da 3 minuti che sembrano un gioco: guadagni XP, sblocchi livelli e mantieni la serie. In poco tempo
            passi dal primo taglio a un montaggio completo.
          </>
        }
        art={<SiteScene name="slide" className="aspect-[5/4] w-full" />}
      />

      <FeatureRow
        flip
        title="pratica vera, non solo video"
        text={
          <>
            Ogni lezione ha esercizi in un editor nel browser che si usa come Premiere Pro: stessa timeline, stessi
            strumenti, stesse scorciatoie. Quello che impari qui lo rifai uguale nel software vero.
          </>
        }
        art={<SiteScene name="clap" className="aspect-[5/4] w-full" />}
      />

      <FeatureRow
        title="resta motivato"
        text={
          <>
            Quest giornaliere, obiettivi da collezionare, serie da non spezzare e amici da sfidare. {brand.mascotName} ti
            ricorda di allenarti, ogni giorno.
          </>
        }
        art={<BadgeCloud />}
      />

      <FeatureRow
        flip
        title="dalla base ai livelli pro"
        text={
          <>
            {sections.length} sezioni e {allLessons.length} lezioni: montaggio, audio, color correction con Rec.709 e
            scopes, motion graphics con keyframe ed easing, fino all&apos;export per i social e al progetto finale.
          </>
        }
        art={<SiteScene name="keyframe" className="aspect-[5/4] w-full" />}
      />

      {/* Download */}
      <section className="border-y border-line bg-panel/60">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <Reveal>
            <h2 className="mb-4 text-4xl font-black leading-tight md:text-5xl">
              impara ovunque, <span className="text-cheese">in qualsiasi momento</span>
            </h2>
            <p className="mb-6 text-lg text-ink-dim">
              Sul telefono nei ritagli di tempo, sul computer quando vuoi fare pratica seria. I progressi ti seguono.
            </p>
            <StoreButtons />
          </Reveal>
          <Reveal delay={150}>
            <SiteScene name="run" className="aspect-[5/4] w-full" />
          </Reveal>
        </div>
      </section>

      {/* Pro: banda scura a tutta larghezza, come "Super Duolingo" */}
      <section className="relative overflow-hidden bg-[#14112e]">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-pr/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cheese/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-6 py-20 md:grid-cols-2 md:py-28">
          <Reveal>
            {/* Squeak al cantiere: Pro è in costruzione */}
            <SiteScene name="construction" className="aspect-[4/3] w-full" />
          </Reveal>
          <Reveal delay={150} className="text-center md:text-left">
            <p className="text-sm font-black uppercase italic tracking-[0.2em] text-white">Potenzia il tuo montaggio con</p>
            <h2 className="mb-4 bg-linear-to-r from-pr via-[#c9a7ff] to-cheese bg-clip-text text-5xl font-black uppercase italic leading-none tracking-tight text-transparent md:text-6xl">
              {brand.appName} Pro
            </h2>
            <p className="mb-7 text-lg text-[#c9c6e6]">
              Lezioni illimitate e {brand.aiName}, l&apos;assistente che guarda la tua timeline e ti spiega cosa non va.
            </p>
            {features.payments ? (
              <Link href="/pricing" className="duo-btn duo-violet">
                Scopri Pro
              </Link>
            ) : (
              <span className="duo-btn duo-cheese pointer-events-none">
                <Hammer size={18} /> {COMING_SOON}
              </span>
            )}
          </Reveal>
        </div>
      </section>

      {/* Community */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <Reveal className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <SiteScene name="discord" className="mx-auto aspect-square w-60" />
          <div className="text-center md:text-left">
            <h2 className="mb-3 text-4xl font-black text-pr md:text-5xl">entra nella community</h2>
            <p className="mb-6 text-lg text-ink-dim">Aggiornamenti, sfide di montaggio e feedback diretto: ci vediamo su Discord.</p>
            <a href={brand.discordUrl} target="_blank" rel="noreferrer" className="duo-btn" style={{ ["--face" as string]: "#5865f2", ["--shade" as string]: "#3c45a5", ["--ink" as string]: "#fff" }}>
              <MessagesSquare size={18} /> Unisciti al Discord
            </a>
          </div>
        </Reveal>
      </section>

      {/* CTA finale con l'onda che scende nel footer, come in Duolingo */}
      <section className="relative pt-16">
        <Reveal className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
          <h2 className="mb-8 text-4xl font-black leading-tight text-pr md:text-6xl">
            impara il montaggio
            <br />
            con {brand.appName}
          </h2>
          <PrimaryCta className="w-72" />
          <Mascot size={180} idle className="mt-10" />
        </Reveal>
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="-mt-10 block h-24 w-full md:h-36" aria-hidden>
          <path d="M0 70 C 240 140 480 0 720 60 C 960 120 1200 20 1440 80 L1440 140 L0 140 Z" fill="var(--color-pr)" />
        </svg>
      </section>

      <SiteFooter />
    </div>
  );
}
