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
import { CheeseScene, ClapScene, CutScene, KeyframeScene, RunScene } from "@/components/brand/scenes";
import { HeroArt } from "@/components/site/HeroArt";
import { Reveal } from "@/components/site/Reveal";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { StoreButtons } from "@/components/site/StoreButtons";
import { brand } from "@/config/brand";
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
    <Link
      href="/learn"
      className={clsx("btn-3d block rounded-2xl bg-success px-8 py-4 text-center font-black uppercase tracking-wide text-[#08311f]", className)}
    >
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
      <CheeseScene />
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
            <Link
              href="/login"
              className="btn-3d block rounded-2xl border-2 border-line bg-panel px-8 py-4 font-black uppercase tracking-wide text-pr"
            >
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
        art={<CutScene />}
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
        art={<ClapScene />}
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
        art={<KeyframeScene />}
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
            <RunScene />
          </Reveal>
        </div>
      </section>

      {/* Pro */}
      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <Reveal className="relative overflow-hidden rounded-[32px] border border-pr/40 bg-linear-to-br from-pr/25 via-panel to-panel p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-cheese">
                <Crown size={18} /> {brand.appName} Pro
              </p>
              <h2 className="mb-3 text-3xl font-black md:text-4xl">Lezioni illimitate e {brand.aiName}</h2>
              <p className="mb-6 text-ink-dim">
                Niente limite giornaliero e un assistente che guarda la tua timeline e ti spiega cosa non va.
              </p>
              <Link href="/pricing" className="btn-3d inline-block rounded-2xl bg-pr px-8 py-3.5 font-black uppercase text-pr-deep">
                Scopri Pro
              </Link>
            </div>
            <Mascot size={200} idle mood="wow" className="mx-auto" />
          </div>
        </Reveal>
      </section>

      {/* Community */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <Reveal className="flex flex-col items-center gap-6 rounded-[32px] border border-line bg-panel p-8 text-center md:flex-row md:text-left">
          <Mascot size={110} idle flip />
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-black">Entra nella community</h2>
            <p className="text-ink-dim">Aggiornamenti, sfide di montaggio e feedback diretto: ci vediamo su Discord.</p>
          </div>
          <a
            href={brand.discordUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-3d flex items-center gap-2 rounded-2xl bg-[#5865f2] px-6 py-3 font-black text-white"
          >
            <MessagesSquare size={18} /> Unisciti al Discord
          </a>
        </Reveal>
      </section>

      {/* CTA finale */}
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
        <Reveal className="flex flex-col items-center">
          <Mascot size={160} idle />
          <h2 className="mb-8 mt-4 text-4xl font-black leading-tight md:text-5xl">
            impara il montaggio con <span className="text-pr">{brand.appName}</span>
          </h2>
          <PrimaryCta className="w-72" />
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
