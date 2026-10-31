import clsx from "clsx";
import { brand } from "@/config/brand";

export type MascotMood = "happy" | "sleepy" | "wow" | "sad" | "dizzy";

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

export function AppIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={clsx("shrink-0", className)} style={{ borderRadius: size * 0.24 }} aria-hidden>
      <defs>
        <linearGradient id="sq-icon-BG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3d3d45"/><stop offset="0.45" stopColor="#18181c"/><stop offset="1" stopColor="#030304"/></linearGradient>
        <radialGradient id="sq-icon-GLOW"><stop offset="0" stopColor="#ffffff" stopOpacity="0.16"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></radialGradient>
        <radialGradient id="sq-icon-HEAD" gradientUnits="userSpaceOnUse" cx="38" cy="42" r="62"><stop offset="0" stopColor="#ffffff"/><stop offset="0.55" stopColor="#e4e6ee"/><stop offset="1" stopColor="#a9aebd"/></radialGradient>
        <clipPath id="sq-icon-CLIP"><rect width="100" height="100" rx="24"/></clipPath>
      </defs>
      {/* topolino tondo su fondo scuro sfumato */}
      <g clipPath="url(#sq-icon-CLIP)">
        <rect width={100} height={100} fill="url(#sq-icon-BG)" />
        <circle cx={22} cy={18} r={40} fill="url(#sq-icon-GLOW)" />
        {/* solo il musetto, a tutto quadrato */}
        <g transform="translate(0 0)">
          <circle cx={12} cy={14} r={22} fill="url(#sq-icon-HEAD)" />
          <circle cx={13} cy={15} r={14} fill="#ffb3c9" />
          <circle cx={88} cy={14} r={22} fill="url(#sq-icon-HEAD)" />
          <circle cx={87} cy={15} r={14} fill="#ffb3c9" />
          <ellipse cx={50} cy={64} rx={50} ry={46} fill="url(#sq-icon-HEAD)" />
          <ellipse cx={22} cy={72} rx={8} ry={5} fill="#ffb3c9" opacity={0.75} />
          <ellipse cx={78} cy={72} rx={8} ry={5} fill="#ffb3c9" opacity={0.75} />
          <ellipse cx={34} cy={53} rx={9} ry={11} fill="#15151b" />
          <circle cx={31} cy={48.5} r={3.8} fill="#fff" />
          <circle cx={37} cy={58} r={1.6} fill="#fff" />
          <ellipse cx={66} cy={53} rx={9} ry={11} fill="#15151b" />
          <circle cx={63} cy={48.5} r={3.8} fill="#fff" />
          <circle cx={69} cy={58} r={1.6} fill="#fff" />
          <ellipse cx={50} cy={69} rx={5.5} ry={4.2} fill="#ff6f9a" />
          <ellipse cx={48.4} cy={67.6} rx={1.6} ry={1.1} fill="#fff" opacity={0.85} />
          <path d="M42 76 q4 4 8 0 q4 4 8 0" stroke="#5a5d6e" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <path d="M14 66 L0 62 M14 70 L-1 71 M83 66 L100 62 M84 70 L101 71" stroke="#a7abb8" strokeWidth={1.2} strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
