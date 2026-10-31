"use client";

import { useId, type ReactNode } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { DEFAULT_AVATAR, useSettings, type Avatar } from "@/lib/settings/store";

export const FURS = [
  { name: "Grigio", light: "#ffffff", main: "#e4e6ee", dark: "#a9aebd" },
  { name: "Nocciola", light: "#f3dcc4", main: "#c99a6e", dark: "#8f6640" },
  { name: "Neve", light: "#ffffff", main: "#f7f7fa", dark: "#d4d6df" },
  { name: "Notte", light: "#8a8c99", main: "#55576a", dark: "#2c2d38" },
  { name: "Oro", light: "#fff2c4", main: "#f0c35e", dark: "#bf8d34" },
  { name: "Caramella", light: "#ffe3ee", main: "#f7b4cd", dark: "#d27c9e" },
];

export const SHIRT_COLORS = ["#5aa9ff", "#ff6b7a", "#3ecf8e", "#ffc93c", "#9999ff", "#2b2b36", "#f5f5f5", "#ff8a3d"];

export const SHIRTS = ["T-shirt", "Felpa", "Canotta", "Maglia a righe", "Giacca", "Niente", "Divisa da esploratore", "Tuta da combattimento"];
export const EYES = ["Anime", "Felici ^ ^", "> <", "Tondi O O", "Bersaglio ◉", "Spirale @ @", "Chiusi", "Pianto T T", "Occhiolino", "Decisi", "Puntini"];
export const MUSCLES = ["Magro", "Normale", "Atletico", "Palestrato"];
export const ACCESSORIES = [
  "Nessuno",
  "Fiocco",
  "Occhiali tondi",
  "Occhiali da sole",
  "Cuffie",
  "Corona",
  "Aureola",
  "Cerchietto da gatto",
  "Berretto",
  "Bandana",
  "Cappello di paglia",
  "Capelli alla Goku",
  "Capelli di Ryuk",
  "Death Note",
  "Movimento tridimensionale",
  "Sciarpa rossa",
  "Coprifronte ninja",
];

export const BACKGROUNDS: { name: string; stops: [string, string, string]; blob: string }[] = [
  { name: "Notte", stops: ["#4a4a58", "#18181c", "#030304"], blob: "#9999ff" },
  { name: "Viola", stops: ["#b9a8ff", "#6b4fe0", "#2a1460"], blob: "#ff8ad8" },
  { name: "Tramonto", stops: ["#ffd36e", "#ff7a59", "#a3245e"], blob: "#fff1a8" },
  { name: "Oceano", stops: ["#8ef0ff", "#2d8ceb", "#0b2a6b"], blob: "#a8fff0" },
  { name: "Menta", stops: ["#b6ffd9", "#3ecf8e", "#0d5b4a"], blob: "#fff6a8" },
  { name: "Fragola", stops: ["#ffc2d8", "#ff6fa8", "#8a1f5c"], blob: "#ffe0f0" },
  { name: "Formaggio", stops: ["#fff1a0", "#ffc93c", "#c46a00"], blob: "#ffffff" },
  { name: "Aurora", stops: ["#a8ff78", "#4facfe", "#5b2a86"], blob: "#f9f871" },
  { name: "Fuoco", stops: ["#ffe08a", "#ff5f5f", "#4a0d1f"], blob: "#ffb36b" },
  { name: "Ghiaccio", stops: ["#ffffff", "#a6c1ee", "#3b4a7a"], blob: "#fbc2eb" },
];

export const bgCss = (i: number) => {
  const b = BACKGROUNDS[i % BACKGROUNDS.length];
  return `radial-gradient(circle at 22% 20%, ${b.blob}aa 0, transparent 45%), radial-gradient(circle at 85% 90%, ${b.stops[0]}88 0, transparent 40%), linear-gradient(135deg, ${b.stops.join(", ")})`;
};

const darker = (hex: string, k = 0.75) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(v * k).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

const INK = "#1b1b24";
const EYE_L = 76;
const EYE_R = 124;
const EYE_Y = 94;

export function AvatarArt({ avatar, size = 96, round = true }: { avatar: Avatar; size?: number; round?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const a = { ...DEFAULT_AVATAR, ...avatar };
  const fur = FURS[a.fur % FURS.length];
  const bg = BACKGROUNDS[a.bg % BACKGROUNDS.length];
  const shirt = a.shirt % SHIRTS.length;
  const acc = a.accessory % ACCESSORIES.length;
  const m = Math.max(0, Math.min(3, a.muscles));
  const shirtC = shirt === 6 ? "#8a5a3c" : shirt === 7 ? "#ff8a1f" : SHIRT_COLORS[a.shirtColor % SHIRT_COLORS.length];
  const shirtD = darker(shirtC);
  const sw = [30, 36, 44, 54][m];
  const bw = [sw + 4, sw + 2, sw * 0.85, sw * 0.74][m];
  const arm = [9, 11, 15, 20][m];
  const torso = `M${100 - bw} 215 L${100 - sw} 158 Q${100 - sw} 136 ${100 - sw + 18} 134 L${100 + sw - 18} 134 Q${100 + sw} 136 ${100 + sw} 158 L${100 + bw} 215 Z`;
  const bareArms = shirt === 2 || shirt === 5;
  const fullSleeves = shirt === 1 || shirt === 4 || shirt === 6;
  const id = (k: string) => `${k}${uid}`;
  const furFill = `url(#${id("fur")})`;

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="block" style={{ borderRadius: round ? "50%" : 28 }} aria-hidden>
      <defs>
        <linearGradient id={id("bg")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg.stops[0]} />
          <stop offset="0.5" stopColor={bg.stops[1]} />
          <stop offset="1" stopColor={bg.stops[2]} />
        </linearGradient>
        <radialGradient id={id("glow")}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={id("blur")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <radialGradient id={id("fur")} gradientUnits="userSpaceOnUse" cx="80" cy="70" r="110">
          <stop offset="0" stopColor={fur.light} />
          <stop offset="0.55" stopColor={fur.main} />
          <stop offset="1" stopColor={fur.dark} />
        </radialGradient>
        <clipPath id={id("t")}>
          <path d={torso} />
        </clipPath>
        {[-1, 1].map((s) => (
          <clipPath key={s} id={id(`a${s}`)}>
            <ellipse cx={100 + s * (sw + arm * 0.3)} cy={174} rx={arm} ry={28} />
          </clipPath>
        ))}
      </defs>

      {/* sfondo sfocato come l'icona */}
      <rect width="200" height="200" fill={`url(#${id("bg")})`} />
      <circle cx="40" cy="36" r="52" fill={bg.blob} opacity="0.55" filter={`url(#${id("blur")})`} />
      <circle cx="176" cy="178" r="56" fill={bg.stops[0]} opacity="0.45" filter={`url(#${id("blur")})`} />
      <circle cx="44" cy="36" r="80" fill={`url(#${id("glow")})`} />
      {/* il personaggio un po' rimpicciolito: si vedono anche le manine */}
      <g transform="translate(12 14) scale(0.88)">

      {/* capelli di Ryuk: dietro la testa per spuntare tutto intorno */}
      {acc === 12 && <RyukHair />}

      {/* orecchie */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <circle cx={100 + s * 54} cy={46} r={29} fill={furFill} />
          <circle cx={100 + s * 52} cy={48} r={18} fill="#ffb3c9" />
        </g>
      ))}

      {/* cappuccio della felpa dietro la testa */}
      {shirt === 1 && <path d={`M${100 - sw - 6} 150 Q100 112 ${100 + sw + 6} 150 L${100 + sw - 4} 160 Q100 132 ${100 - sw + 4} 160 Z`} fill={shirtD} />}

      {/* braccia con le manine */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={100 + s * (sw + arm * 0.3)} cy={174} rx={arm} ry={28} fill={fullSleeves ? shirtC : shirt === 7 ? "#2a5bd7" : furFill} />
          {(shirt === 0 || shirt === 3 || shirt === 7) && <rect x={100 + s * (sw + arm * 0.3) - arm - 1} y={140} width={arm * 2 + 2} height={30} fill={shirtC} clipPath={`url(#${id(`a${s}`)})`} />}
          {bareArms && m >= 2 && <path d={`M${100 + s * (sw + arm * 0.3) - arm * 0.55} 172 q${arm * 0.55} -9 ${arm * 1.1} 0`} fill="none" stroke={fur.dark} strokeWidth="2.5" strokeLinecap="round" />}
          <circle cx={100 + s * (sw + arm * 0.3)} cy={198} r={arm * 0.8} fill="#ffc9d6" />
        </g>
      ))}

      {/* busto e maglietta */}
      <path d={torso} fill={shirt === 5 ? furFill : shirtC} />
      <g clipPath={`url(#${id("t")})`}>
        {shirt === 2 && (
          <>
            <path d={`M${100 - sw - 8} 215 L${100 - sw} 150 L${100 - sw * 0.55} 134 L${100 - sw * 0.72} 215 Z`} fill={furFill} />
            <path d={`M${100 + sw + 8} 215 L${100 + sw} 150 L${100 + sw * 0.55} 134 L${100 + sw * 0.72} 215 Z`} fill={furFill} />
            <path d={`M${100 - sw * 0.3} 134 Q100 158 ${100 + sw * 0.3} 134 Z`} fill={furFill} />
          </>
        )}
        {shirt === 3 && [146, 162, 178, 194, 210].map((y) => <rect key={y} x="0" y={y} width="200" height="7" fill="#fff" opacity="0.85" />)}
        {shirt === 5 && <ellipse cx="100" cy="200" rx={bw * 0.68} ry="40" fill="#fff" opacity="0.55" />}
        {shirt === 4 && (
          <>
            <path d="M100 134 L86 134 L100 215 L114 134 Z" fill="#f4f4f4" />
            <path d="M100 140 l-5 6 l5 34 l5 -34 Z" fill="#e0353f" />
            <path d="M86 134 L100 196 M114 134 L100 196" stroke={shirtD} strokeWidth="3" fill="none" />
          </>
        )}
        {shirt === 1 && (
          <>
            <path d="M74 215 L74 190 Q100 184 126 190 L126 215" fill={shirtD} />
            <path d="M93 140 L91 166 M107 140 L109 166" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {shirt === 6 && (
          <>
            {/* giacchetta corta aperta sulla camicia bianca, con lo stemma delle ali */}
            <path d="M84 134 L100 215 L116 134 Z" fill="#f2efe6" />
            <rect x={100 - bw} y="182" width={bw * 2} height="40" fill="#efe9dc" />
            <g transform={`translate(${100 - sw * 0.55} 152)`}>
              <path d="M0 0 q-9 -5 -13 4 q7 0 9 7 Z" fill="#fff" />
              <path d="M2 0 q9 -5 13 4 q-7 0 -9 7 Z" fill="#3d6fd8" />
            </g>
          </>
        )}
        {shirt === 7 && (
          <>
            {/* tuta arancione con maglia blu sotto e cintura */}
            <path d="M86 134 L100 160 L114 134 Z" fill="#2a5bd7" />
            <rect x="0" y="188" width="200" height="9" fill="#2a5bd7" />
            <circle cx={100 + sw * 0.45} cy="154" r="7" fill="#fff" />
          </>
        )}
        {m >= 2 && shirt !== 4 && shirt !== 7 && (
          <g stroke={shirt === 5 ? fur.dark : shirtD} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8">
            <path d={`M${100 - sw * 0.75} 162 Q${100 - sw * 0.4} ${m === 3 ? 176 : 170} 98 164`} />
            <path d={`M${100 + sw * 0.75} 162 Q${100 + sw * 0.4} ${m === 3 ? 176 : 170} 102 164`} />
          </g>
        )}
        {m === 3 && shirt === 5 && (
          <g stroke={fur.dark} strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M100 176 V212" />
            <path d="M90 186 H110 M90 198 H110" />
          </g>
        )}
      </g>
      {(shirt === 0 || shirt === 3) && <path d="M86 135 Q100 148 114 135" fill="none" stroke={shirtD} strokeWidth="3" />}

      {/* accessori sul corpo (sotto la testa) */}
      {acc === 14 && <OdmGear sw={sw} bw={bw} />}
      {acc === 15 && <Scarf />}

      {/* testone stile icona */}
      <ellipse cx="100" cy="90" rx="58" ry="52" fill={furFill} />
      {/* guance con i trattini ///, come nei kaomoji */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={100 + s * 34} cy={110} rx={10} ry={6} fill="#ffb3c9" opacity="0.8" />
          <path d={`M${100 + s * 34 - 6} 113 l3 -6 M${100 + s * 34 - 1} 113 l3 -6 M${100 + s * 34 + 4} 113 l3 -6`} stroke="#ff7fa5" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
        </g>
      ))}
      <Eyes kind={a.eyes % EYES.length} />
      {/* nasino e bocca a ω */}
      <ellipse cx="100" cy="106" rx="6.5" ry="4.8" fill="#ff6f9a" />
      <ellipse cx="98.4" cy="104.6" rx="1.8" ry="1.2" fill="#fff" opacity="0.85" />
      <path d="M91 113 q4.5 5 9 0 q4.5 5 9 0" fill="none" stroke="#5a5d6e" strokeWidth="2.2" strokeLinecap="round" />
      <g stroke="#a7abb8" strokeWidth="1.4" strokeLinecap="round">
        <path d="M58 104 L40 100 M58 109 L39 110" />
        <path d="M142 104 L160 100 M142 109 L161 110" />
      </g>

      <Accessory kind={acc} />
      </g>
    </svg>
  );
}

function Eyes({ kind }: { kind: number }) {
  const both = (f: (x: number, s: number) => ReactNode) => (
    <>
      {f(EYE_L, -1)}
      {f(EYE_R, 1)}
    </>
  );
  const line = { fill: "none", stroke: INK, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case 1:
      return both((x) => <path key={x} d={`M${x - 9} ${EYE_Y + 3} L${x} ${EYE_Y - 7} L${x + 9} ${EYE_Y + 3}`} {...line} />);
    case 2:
      return (
        <>
          <path d={`M${EYE_L - 8} ${EYE_Y - 8} L${EYE_L + 8} ${EYE_Y} L${EYE_L - 8} ${EYE_Y + 8}`} {...line} />
          <path d={`M${EYE_R + 8} ${EYE_Y - 8} L${EYE_R - 8} ${EYE_Y} L${EYE_R + 8} ${EYE_Y + 8}`} {...line} />
        </>
      );
    case 3:
      return both((x) => <circle key={x} cx={x} cy={EYE_Y} r="8" fill="#fff" stroke={INK} strokeWidth="4" />);
    case 4:
      return both((x) => (
        <g key={x}>
          <circle cx={x} cy={EYE_Y} r="10" fill="#fff" stroke={INK} strokeWidth="3.5" />
          <circle cx={x} cy={EYE_Y} r="5" fill={INK} />
        </g>
      ));
    case 5:
      return both((x) => <path key={x} d={`M${x} ${EYE_Y} m-1 0 a1.5 1.5 0 1 1 3 0 a4 4 0 1 1 -7 -1 a6.5 6.5 0 1 1 12 2 a9 9 0 1 1 -17 -3`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />);
    case 6:
      return both((x, s) => (
        <g key={x}>
          <path d={`M${x - 10} ${EYE_Y - 1} Q${x} ${EYE_Y + 7} ${x + 10} ${EYE_Y - 1}`} {...line} />
          <path d={`M${x + 10 * s} ${EYE_Y - 1} l${4 * s} -4`} {...line} strokeWidth={3} />
        </g>
      ));
    case 7:
      return both((x) => (
        <g key={x}>
          <path d={`M${x - 9} ${EYE_Y - 6} H${x + 9} M${x} ${EYE_Y - 6} V${EYE_Y + 6}`} {...line} />
          <path d={`M${x - 3} ${EYE_Y + 9} q3 10 0 18 q-3 -8 0 -18`} fill="#7fd0ff" opacity="0.9" />
        </g>
      ));
    case 8:
      return (
        <>
          <path d={`M${EYE_L - 8} ${EYE_Y - 7} L${EYE_L + 7} ${EYE_Y} L${EYE_L - 8} ${EYE_Y + 7}`} {...line} />
          <AnimeEye x={EYE_R} />
        </>
      );
    case 9:
      return both((x, s) => (
        <g key={x}>
          <path d={`M${x + 11 * s} ${EYE_Y - 9} L${x - 11 * s} ${EYE_Y - 2} Q${x} ${EYE_Y + 12} ${x + 11 * s} ${EYE_Y - 9} Z`} fill={INK} />
          <circle cx={x + 3 * s} cy={EYE_Y - 1} r="2.2" fill="#fff" />
        </g>
      ));
    case 10:
      return both((x) => <circle key={x} cx={x} cy={EYE_Y + 2} r="4.5" fill={INK} />);
    default:
      return both((x) => <AnimeEye key={x} x={x} />);
  }
}

function AnimeEye({ x }: { x: number }) {
  return (
    <g>
      <ellipse cx={x} cy={EYE_Y} rx="10.5" ry="13" fill="#15151b" />
      <ellipse cx={x} cy={EYE_Y + 5} rx="7" ry="6" fill="#3b3f63" opacity="0.8" />
      <circle cx={x - 3.5} cy={EYE_Y - 5} r="4.5" fill="#fff" />
      <circle cx={x + 4} cy={EYE_Y + 6} r="1.9" fill="#fff" />
    </g>
  );
}

function RyukHair() {
  const spikes = [
    [30, 70, 2, 40],
    [36, 40, 18, 12],
    [60, 26, 52, -8],
    [88, 22, 90, -14],
    [114, 22, 122, -12],
    [140, 26, 158, 0],
    [162, 40, 192, 18],
    [170, 70, 198, 58],
    [28, 96, -2, 100],
    [172, 96, 202, 104],
  ];
  return (
    <g fill="#141418">
      <ellipse cx="100" cy="74" rx="70" ry="54" />
      {spikes.map(([x, y, tx, ty], i) => (
        <path key={i} d={`M${x - 12} ${y + 8} L${tx} ${ty} L${x + 12} ${y - 2} Z`} />
      ))}
    </g>
  );
}

function OdmGear({ sw, bw }: { sw: number; bw: number }) {
  return (
    <g>
      <path d={`M${100 - sw + 6} 140 L${100 + bw - 8} 212 M${100 + sw - 6} 140 L${100 - bw + 8} 212`} stroke="#3a2a20" strokeWidth="5" strokeLinecap="round" />
      <rect x={100 - bw - 2} y="196" width={bw * 2 + 4} height="7" rx="3" fill="#3a2a20" />
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s < 0 ? 100 - bw - 22 : 100 + bw + 4} y="182" width="18" height="30" rx="7" fill="#9aa3b2" stroke="#5d6573" strokeWidth="2" />
          <rect x={s < 0 ? 100 - bw - 20 : 100 + bw + 6} y="186" width="14" height="4" rx="2" fill="#d8dde6" />
          <rect x={s < 0 ? 100 - bw - 26 : 100 + bw + 10} y="168" width="6" height="18" rx="2" fill="#3a3f4a" />
        </g>
      ))}
    </g>
  );
}

function Scarf() {
  return (
    <g>
      <path d="M58 132 Q100 156 142 132 L146 146 Q100 172 54 146 Z" fill="#c8202f" />
      <path d="M118 148 L130 196 L114 198 L108 152 Z" fill="#a8172a" />
      <path d="M62 140 Q100 160 138 140" fill="none" stroke="#ff5a69" strokeWidth="2" opacity="0.6" />
    </g>
  );
}

function Accessory({ kind }: { kind: number }) {
  switch (kind) {
    case 1:
      return (
        <g transform="translate(150 38) rotate(18)">
          <path d="M0 0 L-20 -12 Q-24 0 -20 12 Z" fill="#ff6fa8" />
          <path d="M0 0 L20 -12 Q24 0 20 12 Z" fill="#ff6fa8" />
          <circle r="6" fill="#ff3d86" />
          <path d="M-16 -6 L-8 -2 M16 -6 L8 -2" stroke="#fff" strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />
        </g>
      );
    case 2:
      return (
        <g fill="rgba(255,255,255,0.15)" stroke="#3a2a20" strokeWidth="3">
          <circle cx={EYE_L} cy={EYE_Y} r="16" />
          <circle cx={EYE_R} cy={EYE_Y} r="16" />
          <path d={`M${EYE_L + 16} ${EYE_Y} Q100 ${EYE_Y - 6} ${EYE_R - 16} ${EYE_Y}`} fill="none" />
        </g>
      );
    case 3:
      return (
        <g>
          <rect x={EYE_L - 19} y={EYE_Y - 12} width="36" height="24" rx="10" fill="#15151c" />
          <rect x={EYE_R - 17} y={EYE_Y - 12} width="36" height="24" rx="10" fill="#15151c" />
          <path d={`M${EYE_L + 17} ${EYE_Y - 4} H${EYE_R - 17}`} stroke="#15151c" strokeWidth="4" />
          <path d={`M${EYE_L - 12} ${EYE_Y - 4} l10 -4 M${EYE_R - 10} ${EYE_Y - 4} l10 -4`} stroke="#fff" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
        </g>
      );
    case 4:
      return (
        <g>
          <path d="M42 96 Q40 26 100 24 Q160 26 158 96" fill="none" stroke="#2b2b36" strokeWidth="9" strokeLinecap="round" />
          {[-1, 1].map((s) => (
            <g key={s}>
              <rect x={s < 0 ? 30 : 152} y="80" width="18" height="34" rx="9" fill="#9999ff" />
              <rect x={s < 0 ? 34 : 156} y="86" width="8" height="22" rx="4" fill="#c4c4ff" />
            </g>
          ))}
        </g>
      );
    case 5:
      return (
        <g transform="translate(100 34) rotate(-8)">
          <path d="M-26 10 L-28 -14 L-14 -2 L0 -20 L14 -2 L28 -14 L26 10 Z" fill="#ffd25e" stroke="#c99323" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="0" cy="2" r="4" fill="#ff5f7a" />
          <circle cx="-15" cy="5" r="3" fill="#5aa9ff" />
          <circle cx="15" cy="5" r="3" fill="#3ecf8e" />
        </g>
      );
    case 6:
      return (
        <g>
          <ellipse cx="100" cy="22" rx="34" ry="9" fill="none" stroke="#ffe27a" strokeWidth="6" />
          <ellipse cx="100" cy="22" rx="34" ry="9" fill="none" stroke="#fff6c9" strokeWidth="2" />
        </g>
      );
    case 7:
      return (
        <g>
          <path d="M50 66 Q100 22 150 66" fill="none" stroke="#2b2b36" strokeWidth="6" strokeLinecap="round" />
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${100 + s * 34} 38) rotate(${s * 16})`}>
              <path d="M-14 8 L0 -20 L14 8 Z" fill="#2b2b36" />
              <path d="M-7 4 L0 -10 L7 4 Z" fill="#ff8ab0" />
            </g>
          ))}
        </g>
      );
    case 8:
      return (
        <g>
          <path d="M46 70 Q46 18 100 16 Q154 18 154 70 Z" fill="#9999ff" />
          <rect x="42" y="58" width="116" height="18" rx="9" fill="#7b7bdb" />
          <path d="M60 58 v18 M76 58 v18 M92 58 v18 M108 58 v18 M124 58 v18 M140 58 v18" stroke="#6a6ad0" strokeWidth="3" />
          <circle cx="100" cy="14" r="11" fill="#fff" />
        </g>
      );
    case 9:
      return (
        <g>
          <path d="M44 66 Q100 44 156 66 L156 78 Q100 58 44 78 Z" fill="#e0353f" />
          <path d="M156 70 L176 60 L172 76 Z M156 74 L174 88 L162 92 Z" fill="#c42532" />
          <circle cx="76" cy="62" r="1.8" fill="#fff" />
          <circle cx="110" cy="57" r="1.8" fill="#fff" />
          <circle cx="134" cy="62" r="1.8" fill="#fff" />
        </g>
      );
    case 10:
      return (
        <g>
          <ellipse cx="100" cy="50" rx="76" ry="15" fill="#f0cf6a" />
          <path d="M60 50 Q62 10 100 10 Q138 10 140 50 Z" fill="#f4d878" />
          <path d="M61 40 Q100 48 139 40 L140 50 Q100 58 60 50 Z" fill="#d6283b" />
          <path d="M40 52 Q100 66 160 52" fill="none" stroke="#d9b24c" strokeWidth="2" />
        </g>
      );
    case 11:
      return (
        <g fill="#16161c">
          <path d="M42 74 Q42 32 100 30 Q158 32 158 74 Q100 50 42 74 Z" />
          <path d="M42 74 L18 46 L48 50 L30 14 L66 34 L70 -4 L92 26 L108 -10 L118 26 L146 -2 L142 34 L182 18 L156 52 L186 60 L156 76 Q150 46 100 42 Q50 46 42 74 Z" />
          <path d="M60 56 L74 84 L82 58 L94 82 L100 56 L112 80 L118 58 L132 78 L140 56 Q100 40 60 56 Z" />
        </g>
      );
    case 12:
      return (
        <g fill="#141418">
          <path d="M42 74 Q42 32 100 30 Q158 32 158 74 Q100 50 42 74 Z" />
          <path d="M48 64 L60 86 L68 60 L80 90 L88 58 L100 88 L110 58 L120 90 L130 60 L140 86 L152 64 Q100 30 48 64 Z" />
        </g>
      );
    case 13:
      return (
        <g transform="translate(58 176) rotate(-12)">
          <rect x="-22" y="-28" width="44" height="56" rx="3" fill="#121216" stroke="#3a3a46" strokeWidth="2" />
          <text x="0" y="-6" textAnchor="middle" fontSize="8.5" fontFamily="Georgia, serif" fontStyle="italic" fill="#e8e8e8">
            DEATH
          </text>
          <text x="0" y="5" textAnchor="middle" fontSize="8.5" fontFamily="Georgia, serif" fontStyle="italic" fill="#e8e8e8">
            NOTE
          </text>
          <circle cx="15" cy="15" r="5" fill="#ffc9d6" />
        </g>
      );
    case 16:
      return (
        <g>
          <path d="M42 64 Q100 46 158 64 L158 80 Q100 62 42 80 Z" fill="#26407a" />
          <rect x="76" y="50" width="48" height="24" rx="5" fill="#cfd5df" stroke="#8a93a3" strokeWidth="2" />
          <path d="M100 56 a6 6 0 1 1 -6 6 a3 3 0 1 1 3 -3" fill="none" stroke="#5d6573" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M106 58 l8 -4" stroke="#5d6573" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M158 70 L180 80 L174 92 Z M158 74 L176 100 L164 102 Z" fill="#26407a" />
        </g>
      );
    default:
      return null;
  }
}

export function MyAvatar({ size = 36, round = true }: { size?: number; round?: boolean }) {
  const hydrated = useHydrated();
  const avatar = useSettings((s) => s.avatar);
  return <AvatarArt avatar={hydrated ? avatar : DEFAULT_AVATAR} size={size} round={round} />;
}
