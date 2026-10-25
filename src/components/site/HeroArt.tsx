import { Clapperboard, Diamond, Film, Music2, Palette, Scissors, type LucideIcon } from "lucide-react";
import { LoungeHero } from "@/components/three/lazy";

// Squeak in 3D che entra e si mette a leggere sulla sdraio, con gli
// "attrezzi del mestiere" che fluttuano intorno (come la home di Duolingo).
const ORBIT: { icon: LucideIcon; color: string; x: string; y: string; delay: string; size: number }[] = [
  { icon: Scissors, color: "#ff5f5f", x: "2%", y: "8%", delay: "0s", size: 56 },
  { icon: Film, color: "#2d8ceb", x: "80%", y: "2%", delay: "0.6s", size: 62 },
  { icon: Palette, color: "#ff9a5c", x: "88%", y: "58%", delay: "1.2s", size: 52 },
  { icon: Diamond, color: "#ffc93c", x: "0%", y: "66%", delay: "1.8s", size: 48 },
  { icon: Music2, color: "#3ecf8e", x: "44%", y: "-3%", delay: "0.9s", size: 46 },
  { icon: Clapperboard, color: "#9999ff", x: "72%", y: "86%", delay: "1.5s", size: 50 },
];

export function HeroArt() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-[10%] rounded-full bg-linear-to-br from-pr/30 via-accent/10 to-transparent blur-2xl" />
      {ORBIT.map(({ icon: Icon, color, x, y, delay, size }) => (
        <div
          key={color}
          className="float-y pointer-events-none absolute z-10 grid place-items-center rounded-3xl border border-white/10 shadow-2xl"
          style={{ left: x, top: y, width: size, height: size, background: `${color}26`, color, animationDelay: delay }}
        >
          <Icon size={size * 0.48} strokeWidth={2.4} />
        </div>
      ))}
      <LoungeHero className="absolute inset-0" />
      <p className="pointer-events-none absolute -bottom-2 left-0 right-0 text-center text-xs font-bold text-ink-mute">
        Trascina per girare la scena
      </p>
    </div>
  );
}
