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
 * Icona dell'app: la testa tonda di Squeak che sbuca dall'angolo in basso a
 * destra e guarda in alto a sinistra, su gradiente nero/grigio scuro.
 * Stesso disegno di app/icon.svg.
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
          <stop offset="0" stopColor="#3b3b42" />
          <stop offset="0.5" stopColor="#1a1a1e" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
        <radialGradient id="sq-icon-head" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#e6e8ef" />
          <stop offset="1" stopColor="#bfc3d0" />
        </radialGradient>
        <clipPath id="sq-icon-clip">
          <rect width="100" height="100" rx="24" />
        </clipPath>
      </defs>
      <g clipPath="url(#sq-icon-clip)">
        <rect width="100" height="100" fill="url(#sq-icon-bg)" />
        {/* orecchie tonde */}
        <circle cx="32" cy="42" r="17" fill="#cdd1dc" />
        <circle cx="33" cy="43" r="10.5" fill="#ffadc5" />
        <circle cx="66" cy="26" r="17" fill="#cdd1dc" />
        <circle cx="66" cy="27" r="10.5" fill="#ffadc5" />
        {/* testa tonda che sbuca dall'angolo */}
        <circle cx="64" cy="74" r="42" fill="url(#sq-icon-head)" />
        <ellipse cx="51" cy="78" rx="13" ry="9.5" transform="rotate(-18 51 78)" fill="#ffffff" />
        <ellipse cx="35" cy="73" rx="5" ry="3.4" transform="rotate(-18 35 73)" fill="#ffadc5" opacity="0.7" />
        <ellipse cx="72" cy="66" rx="5" ry="3.4" transform="rotate(-18 72 66)" fill="#ffadc5" opacity="0.7" />
        {/* occhioni lucidi che guardano in alto a sinistra */}
        <g transform="rotate(-15 46 61)">
          <ellipse cx="46" cy="61" rx="6" ry="7.6" fill="#15151b" />
          <circle cx="44" cy="58.2" r="2.5" fill="#fff" />
          <circle cx="48" cy="64" r="1.1" fill="#fff" />
        </g>
        <g transform="rotate(-15 66 55)">
          <ellipse cx="66" cy="55" rx="6" ry="7.6" fill="#15151b" />
          <circle cx="64" cy="52.2" r="2.5" fill="#fff" />
          <circle cx="68" cy="58" r="1.1" fill="#fff" />
        </g>
        <ellipse cx="47" cy="73.5" rx="4.8" ry="3.6" transform="rotate(-18 47 73.5)" fill="#ff6f9a" />
        <circle cx="45.6" cy="72.4" r="1.2" fill="#fff" opacity="0.8" />
        <path
          d="M43 80 q3 3.4 6 0 q3 3.4 6 0"
          transform="rotate(-18 49 80)"
          stroke="#5a5d6e"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <g stroke="#9ca0ad" strokeWidth="1.4" strokeLinecap="round">
          <path d="M36 79 L22 77" />
          <path d="M37 82.5 L24 87" />
          <path d="M63 74 L76 70" />
          <path d="M64 77.5 L77 78" />
        </g>
      </g>
    </svg>
  );
}
