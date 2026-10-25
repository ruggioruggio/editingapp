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

/**
 * Icona dell'app: la testa di Squeak che "entra" dall'angolo in basso a destra
 * e guarda in alto a sinistra, su un gradiente viola. Stesso disegno di app/icon.svg.
 */
export function AppIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={clsx("shrink-0", className)}
      style={{ borderRadius: size * 0.24 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="sq-icon-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7b6cff" />
          <stop offset="0.55" stopColor="#3a2a9e" />
          <stop offset="1" stopColor="#0d0a24" />
        </linearGradient>
        <radialGradient id="sq-icon-head" cx="0.3" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#e4e6ef" />
          <stop offset="1" stopColor="#a9aec2" />
        </radialGradient>
        <clipPath id="sq-icon-clip">
          <rect width="100" height="100" rx="24" />
        </clipPath>
      </defs>
      <g clipPath="url(#sq-icon-clip)">
        <rect width="100" height="100" fill="url(#sq-icon-bg)" />
        {/* orecchie sul bordo della testa */}
        <circle cx="31" cy="37" r="17" fill="#d8dbe6" />
        <circle cx="31" cy="37" r="10" fill="#ffaec6" />
        <circle cx="70" cy="19" r="16" fill="#d8dbe6" />
        <circle cx="70" cy="19" r="9" fill="#ffaec6" />
        {/* testa */}
        <circle cx="75" cy="80" r="60" fill="url(#sq-icon-head)" />
        {/* occhi ovali inclinati, sguardo in alto a sinistra */}
        <ellipse cx="47" cy="61" rx="5.2" ry="9.5" transform="rotate(-24 47 61)" fill="#0d0d12" />
        <ellipse cx="66" cy="53" rx="5.2" ry="9.5" transform="rotate(-24 66 53)" fill="#0d0d12" />
        <circle cx="45.5" cy="56.5" r="1.8" fill="#fff" />
        <circle cx="64.5" cy="48.5" r="1.8" fill="#fff" />
        {/* naso */}
        <ellipse cx="33" cy="76" rx="4.6" ry="3.6" transform="rotate(-24 33 76)" fill="#ff6f9a" />
      </g>
    </svg>
  );
}
