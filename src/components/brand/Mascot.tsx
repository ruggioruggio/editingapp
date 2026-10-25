import clsx from "clsx";
import { brand } from "@/config/brand";

export type MascotMood = "happy" | "sleepy" | "wow";

/**
 * Squeak di profilo (guarda a destra), come gruppo SVG in coordinate 120x100.
 * Le classi sq-* servono alle animazioni definite in globals.css.
 */
export function MouseFigure({ mood = "happy" }: { mood?: MascotMood }) {
  return (
    <g className="sq-whole">
      <g className="sq-tail">
        <path
          d="M24 70 C8 68 3 84 13 88 C21 91 26 84 20 80"
          stroke="#f5a3b8"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <ellipse cx="38" cy="88" rx="8" ry="4" fill="#f5a3b8" />
      <ellipse cx="62" cy="88" rx="8" ry="4" fill="#f5a3b8" />
      <ellipse cx="48" cy="67" rx="28" ry="21" fill="#b9c1d0" />
      <ellipse cx="44" cy="72" rx="15" ry="11" fill="#d7dce6" />
      <path
        d="M56 44 C70 34 90 42 104 58 C108 62 106 66 101 67 C88 71 72 74 60 70 C46 66 44 52 56 44Z"
        fill="#c3cad8"
      />
      <g className="sq-ear">
        <circle cx="62" cy="36" r="15" fill="#8e97ab" />
        <circle cx="62" cy="36" r="9" fill="#f5a3b8" />
      </g>
      {mood === "sleepy" ? (
        <path d="M81 53 Q86 57 91 53" stroke="#151515" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      ) : (
        <g className="sq-eye">
          <ellipse cx="86" cy="52" rx={mood === "wow" ? 5.5 : 4} ry={mood === "wow" ? 6 : 4.6} fill="#151515" />
          <circle cx="87.6" cy="50.4" r="1.5" fill="#fff" />
        </g>
      )}
      <circle cx="84" cy="63" r="4" fill="#f5a3b8" opacity="0.5" />
      <circle className="sq-nose" cx="104" cy="61" r="4" fill="#ff6f9a" />
      {mood === "wow" ? (
        <ellipse cx="98" cy="68.5" rx="2.2" ry="2.8" fill="#3a1f2a" />
      ) : (
        <path d="M95 67 Q98 70 101 67" stroke="#151515" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      )}
      <g stroke="#7d8597" strokeWidth="1.2" strokeLinecap="round">
        <path d="M100 62 L117 56" />
        <path d="M100 63 L118 63" />
        <path d="M100 64 L116 70" />
      </g>
      <ellipse className="sq-arm" cx="72" cy="78" rx="5" ry="4" fill="#f5a3b8" />
      {mood === "sleepy" && (
        <text x="100" y="30" fontSize="14" fontWeight="700" fill="#9999ff">
          z
        </text>
      )}
    </g>
  );
}

/** Squeak a figura intera. `idle` attiva respiro, coda, orecchio e battito di ciglia. */
export function Mascot({
  size = 64,
  mood = "happy",
  idle = false,
  flip = false,
  className,
}: {
  size?: number;
  mood?: MascotMood;
  idle?: boolean;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={(size * 100) / 120}
      className={clsx("sq-anim overflow-visible", idle && "sq-idle", className)}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      role="img"
      aria-label={brand.mascotName}
    >
      <MouseFigure mood={mood} />
    </svg>
  );
}

/** Marchio monocromatico di profilo (stile icona app minimal). Usa currentColor. */
export function MouseMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 100" width={size} height={(size * 100) / 120} className={className} aria-hidden>
      <g fill="currentColor">
        <path d="M24 70 C8 68 3 84 13 88 C21 91 26 84 20 80" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="48" cy="67" rx="28" ry="21" />
        <path d="M56 44 C70 34 90 42 104 58 C108 62 106 66 101 67 C88 71 72 74 60 70 C46 66 44 52 56 44Z" />
        <circle cx="62" cy="36" r="15" />
        <ellipse cx="38" cy="88" rx="8" ry="4" />
        <ellipse cx="62" cy="88" rx="8" ry="4" />
      </g>
      {/* occhio e orecchio "scavati" nel colore di sfondo */}
      <circle cx="62" cy="36" r="8" fill="var(--mark-bg, #000)" />
      <circle cx="86" cy="52" r="4" fill="var(--mark-bg, #000)" />
    </svg>
  );
}

/** Icona dell'app: fondo nero, topo bianco di profilo. */
export function AppIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      className={clsx("inline-grid shrink-0 place-items-center bg-black text-white ring-1 ring-white/15", className)}
      style={{ width: size, height: size, borderRadius: size * 0.26, ["--mark-bg" as string]: "#000" }}
    >
      <MouseMark size={size * 0.74} />
    </span>
  );
}
