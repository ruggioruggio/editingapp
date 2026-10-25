import { Clapperboard, Diamond, Film, Music2, Palette, Scissors, type LucideIcon } from "lucide-react";
import { Squeak3D } from "@/components/brand/Squeak3DLazy";

// Squeak in 3D al centro con gli "attrezzi del mestiere" che gli fluttuano
// intorno, come il globo di personaggi della home di Duolingo.
const ORBIT: { icon: LucideIcon; color: string; x: string; y: string; delay: string; size: number }[] = [
  { icon: Scissors, color: "#ff5f5f", x: "4%", y: "12%", delay: "0s", size: 64 },
  { icon: Film, color: "#2d8ceb", x: "76%", y: "4%", delay: "0.6s", size: 72 },
  { icon: Palette, color: "#ff9a5c", x: "86%", y: "54%", delay: "1.2s", size: 60 },
  { icon: Diamond, color: "#ffc93c", x: "0%", y: "62%", delay: "1.8s", size: 56 },
  { icon: Music2, color: "#3ecf8e", x: "42%", y: "-4%", delay: "0.9s", size: 52 },
  { icon: Clapperboard, color: "#9999ff", x: "66%", y: "84%", delay: "1.5s", size: 58 },
];

export function HeroArt() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-[12%] rounded-full bg-linear-to-br from-pr/30 via-accent/10 to-transparent blur-2xl" />
      {ORBIT.map(({ icon: Icon, color, x, y, delay, size }) => (
        <div
          key={color}
          className="float-y pointer-events-none absolute z-10 grid place-items-center rounded-3xl border border-white/10 shadow-2xl"
          style={{ left: x, top: y, width: size, height: size, background: `${color}26`, color, animationDelay: delay }}
        >
          <Icon size={size * 0.48} strokeWidth={2.4} />
        </div>
      ))}
      <Squeak3D mode="showcase" className="absolute inset-[6%] cursor-grab active:cursor-grabbing" />
      <p className="pointer-events-none absolute bottom-1 left-0 right-0 text-center text-xs font-bold text-ink-mute">
        Trascina Squeak per farlo girare
      </p>
    </div>
  );
}
