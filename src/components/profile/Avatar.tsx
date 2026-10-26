"use client";

import { useId } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { DEFAULT_AVATAR, useSettings, type Avatar } from "@/lib/settings/store";

// Avatar del giocatore: Squeak in versione umanoide, personalizzabile con
// pelo, occhi, maglietta, muscoli, accessori e sfondo sfumato.

export const FURS = [
  { name: "Grigio", main: "#b9bfcc", dark: "#8d93a3", light: "#e4e7ee" },
  { name: "Nocciola", main: "#b98a5e", dark: "#8f6640", light: "#e8cfb3" },
  { name: "Neve", main: "#f3f3f5", dark: "#cfd0d8", light: "#ffffff" },
  { name: "Notte", main: "#4a4c58", dark: "#30323c", light: "#8a8c99" },
  { name: "Oro", main: "#e6b65a", dark: "#bf8d34", light: "#f7dfa8" },
  { name: "Caramella", main: "#f2a7c3", dark: "#d27c9e", light: "#fbd6e4" },
];

export const SHIRT_COLORS = ["#2d8ceb", "#ff5f5f", "#3ecf8e", "#ffc93c", "#9999ff", "#1d1d1d", "#f5f5f5", "#ff8a3d"];

export const SHIRTS = ["T-shirt", "Felpa", "Canotta", "Maglia a righe", "Giacca", "Niente"];
export const EYES = ["Normali", "Felici", "Cool", "Stelle", "Occhiolino"];
export const MUSCLES = ["Magro", "Normale", "Atletico", "Palestrato"];
export const ACCESSORIES = ["Nessuno", "Occhiali", "Occhiali da sole", "Cappellino", "Cuffie", "Corona", "Catena d'oro", "Bandana", "Cappello di paglia", "Berretto"];

export const BACKGROUNDS: [string, string][] = [
  ["#9999ff", "#5b3fd1"],
  ["#ffc93c", "#ff7a3d"],
  ["#3ecf8e", "#1f7fa8"],
  ["#ff6fa8", "#7b3fe4"],
  ["#5ce1e6", "#2d5beb"],
  ["#ff5f5f", "#ffb43c"],
  ["#2b2d42", "#8d99ae"],
  ["#a8ff78", "#22b07d"],
  ["#fbc2eb", "#a6c1ee"],
  ["#0f2027", "#2c5364"],
];

const darker = (hex: string, k = 0.75) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(v * k).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

/** Il disegno dell'avatar (SVG quadrato, si adatta al contenitore). */
export function AvatarArt({ avatar, size = 96, round = true }: { avatar: Avatar; size?: number; round?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const a = { ...DEFAULT_AVATAR, ...avatar };
  const fur = FURS[a.fur % FURS.length];
  const shirtC = SHIRT_COLORS[a.shirtColor % SHIRT_COLORS.length];
  const shirtD = darker(shirtC);
  const [g1, g2] = BACKGROUNDS[a.bg % BACKGROUNDS.length];
  const m = Math.max(0, Math.min(3, a.muscles));
  const sw = [32, 39, 47, 57][m]; // mezza larghezza delle spalle
  const arm = [9, 12, 16, 21][m]; // spessore delle braccia
  const shirt = a.shirt % SHIRTS.length;
  // più muscoli = spalle larghe e vita stretta (a V)
  const bw = [sw + 3, sw, sw * 0.82, sw * 0.72][m];
  const torso = `M${100 - bw} 250 L${100 - sw} 156 Q${100 - sw} 138 ${100 - sw + 16} 136 L${100 + sw - 16} 136 Q${100 + sw} 138 ${100 + sw} 156 L${100 + bw} 250 Z`;
  const bareArms = shirt === 2 || shirt === 5;
  const armFill = shirt === 1 || shirt === 4 ? shirtC : fur.main;
  const torsoFill = shirt === 5 ? fur.main : shirt === 4 ? shirtC : shirtC;
  const line = "#1b1b24";

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="block" style={{ borderRadius: round ? "50%" : 24 }} aria-hidden>
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={g1} />
          <stop offset="1" stopColor={g2} />
        </linearGradient>
        <clipPath id={`t${uid}`}>
          <path d={torso} />
        </clipPath>
      </defs>
      <rect width="200" height="200" fill={`url(#bg${uid})`} />
      <circle cx="160" cy="40" r="46" fill="#fff" opacity="0.12" />
      <circle cx="30" cy="170" r="40" fill="#fff" opacity="0.08" />
      {/* figura rimpicciolita: si vede anche il busto, non solo la testa */}
      <g transform="translate(0 8) translate(100 100) scale(0.74) translate(-100 -100)">

      {/* braccia */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <clipPath id={`a${uid}${s}`}>
            <ellipse cx={100 + s * (sw + arm * 0.35)} cy={190} rx={arm} ry={48} />
          </clipPath>
          <ellipse cx={100 + s * (sw + arm * 0.35)} cy={190} rx={arm} ry={48} fill={armFill} stroke={line} strokeWidth="2.5" />
          {/* manica corta della t-shirt e della maglia a righe */}
          {(shirt === 0 || shirt === 3) && (
            <g>
              <rect x={100 + s * (sw + arm * 0.35) - arm - 2} y={136} width={arm * 2 + 4} height={38} fill={shirtC} clipPath={`url(#a${uid}${s})`} />
              <path d={`M${100 + s * (sw + arm * 0.35) - arm} 174 H${100 + s * (sw + arm * 0.35) + arm}`} stroke={line} strokeWidth="2.5" />
            </g>
          )}
          {/* bicipite marcato */}
          {bareArms && m >= 2 && <path d={`M${100 + s * (sw + arm * 0.35 - arm * 0.6)} 166 q${s * arm * 0.6} -10 ${s * arm * 1.1} 0`} fill="none" stroke={fur.dark} strokeWidth="2.5" strokeLinecap="round" />}
        </g>
      ))}

      {/* busto */}
      <path d={torso} fill={torsoFill} stroke={line} strokeWidth="2.5" />
      <g clipPath={`url(#t${uid})`}>
        {shirt === 2 && (
          <>
            <path d={`M${100 - sw - 6} 250 L${100 - sw * 0.55} 140 L${100 - sw * 0.25} 140 Q100 168 ${100 + sw * 0.25} 140 L${100 + sw * 0.55} 140 L${100 + sw + 6} 250 Z`} fill={shirtC} stroke={line} strokeWidth="2.5" />
            <path d={`M${100 - sw - 6} 250 L${100 - sw} 150 L${100 - sw * 0.55} 140 L${100 - sw * 0.75} 250 Z`} fill={fur.main} />
            <path d={`M${100 + sw + 6} 250 L${100 + sw} 150 L${100 + sw * 0.55} 140 L${100 + sw * 0.75} 250 Z`} fill={fur.main} />
          </>
        )}
        {shirt === 3 && [150, 166, 182, 198, 214, 230].map((y) => <rect key={y} x="0" y={y} width="200" height="7" fill="#fff" opacity="0.85" />)}
        {shirt === 5 && <ellipse cx="100" cy="205" rx={bw * 0.7} ry="48" fill={fur.light} />}
        {shirt === 4 && (
          <>
            <path d="M100 136 L84 136 L100 215 L116 136 Z" fill="#f4f4f4" />
            <path d="M100 142 l-5 6 l5 40 l5 -40 Z" fill="#d6283b" stroke={line} strokeWidth="1.5" />
            <path d={`M84 136 L100 205 M116 136 L100 205`} stroke={line} strokeWidth="2.5" fill="none" />
          </>
        )}
        {shirt === 1 && (
          <>
            <path d={`M76 230 L76 196 Q100 190 124 196 L124 230`} fill={shirtD} stroke={line} strokeWidth="2" />
            <path d="M93 142 L91 168 M107 142 L109 168" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {/* pettorali e addominali */}
        {m >= 2 && (
          <g stroke={shirt === 5 ? fur.dark : shirtD} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={shirt === 4 ? 0 : 1}>
            <path d={`M${100 - sw * 0.75} 160 Q${100 - sw * 0.4} ${m === 3 ? 176 : 170} 98 162`} />
            <path d={`M${100 + sw * 0.75} 160 Q${100 + sw * 0.4} ${m === 3 ? 176 : 170} 102 162`} />
            {shirt === 5 && m === 3 && (
              <>
                <path d="M100 174 V222" />
                <path d="M90 186 H110 M90 199 H110 M91 211 H109" />
              </>
            )}
          </g>
        )}
      </g>
      {/* cappuccio della felpa e colletto della t-shirt */}
      {shirt === 1 && <path d="M70 140 Q100 118 130 140 Q100 150 70 140 Z" fill={shirtD} stroke={line} strokeWidth="2.5" />}
      {(shirt === 0 || shirt === 3) && <path d="M86 137 Q100 150 114 137" fill="none" stroke={line} strokeWidth="2.5" />}
      {a.accessory === 6 && (
        <g>
          <path d="M78 140 Q100 176 122 140" fill="none" stroke="#e8b53a" strokeWidth="4" strokeDasharray="5 2" />
          <circle cx="100" cy="160" r="7" fill="#ffd25e" stroke="#9b6d10" strokeWidth="2" />
        </g>
      )}

      {/* collo e testa */}
      <rect x="90" y="122" width="20" height="18" fill={fur.main} stroke={line} strokeWidth="2.5" />
      <g>
        {a.accessory === 4 && <path d="M54 92 Q56 30 100 30 Q144 30 146 92" fill="none" stroke="#2a2a35" strokeWidth="7" />}
        {[-1, 1].map((s) => (
          <g key={s}>
            <circle cx={100 + s * 38} cy={56} r={24} fill={fur.main} stroke={line} strokeWidth="2.5" />
            <circle cx={100 + s * 38} cy={57} r={14} fill="#ffb3c8" />
          </g>
        ))}
        <ellipse cx="100" cy="94" rx="44" ry="39" fill={fur.main} stroke={line} strokeWidth="2.5" />
        <ellipse cx="100" cy="113" rx="24" ry="16" fill={fur.light} />
        <circle cx="74" cy="106" r="7" fill="#ff9ab8" opacity="0.6" />
        <circle cx="126" cy="106" r="7" fill="#ff9ab8" opacity="0.6" />
        <Eyes kind={a.eyes % EYES.length} line={line} fur={fur.main} />
        <ellipse cx="100" cy="104" rx="7.5" ry="5.5" fill="#ff7aa2" stroke={line} strokeWidth="2" />
        <path d="M92 116 Q100 123 108 116" fill="none" stroke={line} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M100 109.5 V116" stroke={line} strokeWidth="2" />
        <g stroke={line} strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
          <path d="M76 108 L56 104 M76 112 L56 114" />
          <path d="M124 108 L144 104 M124 112 L144 114" />
        </g>
      </g>
      <Accessory kind={a.accessory % ACCESSORIES.length} line={line} />
      </g>
    </svg>
  );
}

function Eyes({ kind, line, fur }: { kind: number; line: string; fur: string }) {
  if (kind === 1)
    return (
      <g fill="none" stroke={line} strokeWidth="3.5" strokeLinecap="round">
        <path d="M76 92 Q84 82 92 92" />
        <path d="M108 92 Q116 82 124 92" />
      </g>
    );
  if (kind === 2)
    return (
      <g>
        {[84, 116].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={90} rx="7" ry="8" fill={line} />
            <rect x={x - 9} y="79" width="18" height="8" fill={fur} />
            <path d={`M${x - 9} 87 H${x + 9}`} stroke={line} strokeWidth="3.5" strokeLinecap="round" />
          </g>
        ))}
        <path d="M74 80 L92 84 M126 80 L108 84" stroke={line} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  if (kind === 3)
    return (
      <g>
        {[84, 116].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={90} rx="9" ry="10" fill={line} />
            <path d={`M${x} 83 l2 5 l5 0.5 l-4 3.5 l1.5 5 l-4.5 -3 l-4.5 3 l1.5 -5 l-4 -3.5 l5 -0.5 Z`} fill="#ffd84a" />
          </g>
        ))}
      </g>
    );
  if (kind === 4)
    return (
      <g>
        <ellipse cx="84" cy="90" rx="7" ry="9" fill={line} />
        <circle cx="86.5" cy="86.5" r="2.6" fill="#fff" />
        <path d="M108 91 Q116 85 124 91" fill="none" stroke={line} strokeWidth="3.5" strokeLinecap="round" />
      </g>
    );
  return (
    <g>
      {[84, 116].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={90} rx="7" ry="9" fill={line} />
          <circle cx={x + 2.5} cy={86.5} r="2.6" fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Accessory({ kind, line }: { kind: number; line: string }) {
  switch (kind) {
    case 1:
      return (
        <g fill="rgba(255,255,255,0.18)" stroke={line} strokeWidth="3">
          <circle cx="84" cy="90" r="12" />
          <circle cx="116" cy="90" r="12" />
          <path d="M96 90 H104 M72 88 L58 84 M128 88 L142 84" fill="none" />
        </g>
      );
    case 2:
      return (
        <g stroke={line} strokeWidth="2.5">
          <rect x="69" y="81" width="28" height="18" rx="7" fill="#15151c" />
          <rect x="103" y="81" width="28" height="18" rx="7" fill="#15151c" />
          <path d="M97 88 H103 M69 86 L57 82 M131 86 L143 82" fill="none" />
          <path d="M74 86 l8 0" stroke="#fff" strokeWidth="2" opacity="0.6" />
        </g>
      );
    case 3:
      return (
        <g stroke={line} strokeWidth="2.5">
          <path d="M60 72 Q62 34 100 34 Q138 34 140 72 Z" fill="#ff5f5f" />
          <path d="M100 70 Q140 64 162 74 Q140 80 100 76 Z" fill="#d43c3c" />
          <circle cx="100" cy="36" r="4" fill="#d43c3c" />
          <path d="M84 56 h14 v10 h-14z" fill="#fff" stroke="none" opacity="0.9" />
        </g>
      );
    case 4:
      return (
        <g stroke={line} strokeWidth="2.5">
          <rect x="46" y="78" width="16" height="30" rx="7" fill="#ff5f5f" />
          <rect x="138" y="78" width="16" height="30" rx="7" fill="#ff5f5f" />
        </g>
      );
    case 5:
      return (
        <g stroke="#9b6d10" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M70 62 L72 34 L86 50 L100 28 L114 50 L128 34 L130 62 Z" fill="#ffd25e" />
          <circle cx="100" cy="50" r="4" fill="#ff5f5f" stroke="none" />
          <circle cx="82" cy="56" r="3" fill="#5aa9ff" stroke="none" />
          <circle cx="118" cy="56" r="3" fill="#3ecf8e" stroke="none" />
        </g>
      );
    case 7:
      return (
        <g stroke={line} strokeWidth="2.5">
          <path d="M58 74 Q100 58 142 74 L142 84 Q100 68 58 84 Z" fill="#e0353f" />
          <path d="M142 78 L162 70 L158 82 Z M142 80 L160 92 L150 96 Z" fill="#e0353f" />
          <circle cx="80" cy="72" r="1.6" fill="#fff" stroke="none" />
          <circle cx="110" cy="68" r="1.6" fill="#fff" stroke="none" />
        </g>
      );
    case 8:
      return (
        <g stroke={line} strokeWidth="2.5">
          <ellipse cx="100" cy="62" rx="66" ry="12" fill="#f0cf6a" />
          <path d="M66 60 Q68 24 100 24 Q132 24 134 60 Z" fill="#f0cf6a" />
          <path d="M67 52 Q100 58 133 52 L134 60 Q100 66 66 60 Z" fill="#c7262f" />
        </g>
      );
    case 9:
      return (
        <g stroke={line} strokeWidth="2.5">
          <path d="M58 74 Q58 26 100 26 Q142 26 142 74 Z" fill="#9999ff" />
          <rect x="56" y="64" width="88" height="14" rx="6" fill="#7b7bdb" />
          <circle cx="100" cy="24" r="9" fill="#fff" />
        </g>
      );
    default:
      return null;
  }
}

/** Avatar dell'utente corrente (dalle impostazioni salvate). */
export function MyAvatar({ size = 36, round = true }: { size?: number; round?: boolean }) {
  const hydrated = useHydrated();
  const avatar = useSettings((s) => s.avatar);
  return <AvatarArt avatar={hydrated ? avatar : DEFAULT_AVATAR} size={size} round={round} />;
}
