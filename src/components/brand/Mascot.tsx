import clsx from "clsx";
import { brand } from "@/config/brand";

export type MascotMood = "happy" | "sleepy" | "wow" | "sad" | "dizzy";

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
      ) : mood === "dizzy" ? (
        <path d="M82 48 L90 56 M90 48 L82 56" stroke="#151515" strokeWidth="2.4" strokeLinecap="round" />
      ) : mood === "sad" ? (
        <g>
          <ellipse cx="86" cy="53" rx="4" ry="4.4" fill="#151515" />
          <circle cx="87.4" cy="52" r="1.3" fill="#fff" />
          {/* sopracciglio triste */}
          <path d="M80 45 Q85 44 91 47" stroke="#6b7286" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
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
      ) : mood === "sad" || mood === "dizzy" ? (
        <path d="M95 70 Q98 67 101 70" stroke="#151515" strokeWidth="1.6" fill="none" strokeLinecap="round" />
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
 * Icona dell'app: Squeak con il muso sporgente che sbuca dall'angolo in basso
 * a destra, con un ciak accanto (si parla di montaggio), su gradiente scuro.
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
        {/* una sola sfumatura per testa e muso, così non si vede la giuntura */}
        <radialGradient id="sq-icon-head" gradientUnits="userSpaceOnUse" cx="48" cy="52" r="62">
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
        {/* ciak */}
        <g transform="rotate(-10 24 30)">
          <rect x="10" y="24" width="28" height="18" rx="2.5" fill="#1d1d22" stroke="#f2f2f2" strokeWidth="1.6" />
          <path d="M14 31 H34 M14 36 H28" stroke="#9999ff" strokeWidth="1.8" strokeLinecap="round" />
          <g transform="rotate(-16 10 23)">
            <rect x="9.5" y="17" width="29" height="6" rx="1.5" fill="#f2f2f2" />
            <path d="M14 17 L18 23 M21 17 L25 23 M28 17 L32 23" stroke="#1d1d22" strokeWidth="2.4" />
          </g>
        </g>
        {/* orecchie */}
        <circle cx="54" cy="38" r="15" fill="#cdd1dc" />
        <circle cx="54.5" cy="39" r="9.5" fill="#ffadc5" />
        <circle cx="82" cy="34" r="15" fill="#cdd1dc" />
        <circle cx="82" cy="35" r="9.5" fill="#ffadc5" />
        {/* testa e muso sporgente */}
        <circle cx="68" cy="74" r="34" fill="url(#sq-icon-head)" />
        <path d="M52 56 C41 57 28 61 20 67 C12 73 14 85 25 87 C37 89 50 88 64 85 Z" fill="url(#sq-icon-head)" />
        <ellipse cx="57" cy="76" rx="5" ry="3.4" fill="#ffadc5" opacity="0.75" />
        {/* occhioni */}
        <g transform="rotate(-12 46 63)">
          <ellipse cx="46" cy="63" rx="5.6" ry="7" fill="#15151b" />
          <circle cx="44.2" cy="60.4" r="2.3" fill="#fff" />
          <circle cx="47.8" cy="65.8" r="1" fill="#fff" />
        </g>
        <g transform="rotate(-12 63 60)">
          <ellipse cx="63" cy="60" rx="4.8" ry="6.2" fill="#15151b" />
          <circle cx="61.4" cy="57.6" r="2" fill="#fff" />
        </g>
        {/* naso, bocca e baffi */}
        <circle cx="17.5" cy="74.5" r="5.4" fill="#ff6f9a" />
        <circle cx="16" cy="73" r="1.4" fill="#fff" opacity="0.8" />
        <path d="M27 81 q3 3 6 0 q3 3 6 0" stroke="#5a5d6e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <g stroke="#9ca0ad" strokeWidth="1.3" strokeLinecap="round">
          <path d="M25 72 L9 64" />
          <path d="M25 76 L7 76" />
          <path d="M26 79 L10 87" />
        </g>
      </g>
    </svg>
  );
}
