import type { Subject } from "@/lib/studio/media";

// Filmati finti ma "vivi": ogni soggetto si anima in base al tempo della clip,
// così scorrendo la timeline si vede davvero il video cambiare.

const wave = (t: number, speed: number, amp: number) => Math.sin(t * speed) * amp;

export function MediaVisual({ subject, hue, t, text, thumb }: { subject: Subject; hue: number; t: number; text?: string; thumb?: boolean }) {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {thumb && (subject === "title" || subject === "logo") && (
        <>
          <defs>
            <pattern id="chk" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#3a3a3a" />
              <rect width="5" height="5" fill="#2a2a2a" />
              <rect x="5" y="5" width="5" height="5" fill="#2a2a2a" />
            </pattern>
          </defs>
          <rect width="160" height="90" fill="url(#chk)" />
        </>
      )}
      <Scene subject={subject} hue={hue} t={t} text={text} />
    </svg>
  );
}

function Scene({ subject, hue, t, text }: { subject: Subject; hue: number; t: number; text?: string }) {
  switch (subject) {
    case "person": {
      const talk = Math.abs(Math.sin(t * 9)) * 2.2;
      const bob = wave(t, 1.6, 0.8);
      return (
        <g>
          <rect width="160" height="90" fill={`hsl(${hue} 30% 18%)`} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x="8" y={10 + r * 20} width="44" height="2" fill={`hsl(${hue} 20% 30%)`} />
              {[0, 1, 2, 3, 4, 5].map((b) => (
                <rect key={b} x={10 + b * 7} y={1 + r * 20} width="5" height="9" fill={`hsl(${(hue + b * 50 + r * 30) % 360} 45% ${35 + ((b + r) % 3) * 8}%)`} />
              ))}
            </g>
          ))}
          <circle cx="132" cy="18" r="10" fill="#f6d77a" opacity=".35" />
          <g transform={`translate(0 ${bob})`}>
            <path d="M58 90 Q60 58 80 56 Q100 58 102 90 Z" fill="#3b5ba5" />
            <rect x="76" y="48" width="8" height="10" fill="#d9a07a" />
            <ellipse cx="80" cy="38" rx="13" ry="15" fill="#e8b48e" />
            <path d="M67 36 Q68 20 80 21 Q93 21 93 36 Q90 27 80 27 Q71 27 67 36 Z" fill="#3a2414" />
            <circle cx="75" cy="38" r="1.4" fill="#222" />
            <circle cx="85" cy="38" r="1.4" fill="#222" />
            <ellipse cx="80" cy="46" rx="3" ry={0.6 + talk} fill="#7a2a2a" />
          </g>
        </g>
      );
    }
    case "city": {
      const cars = [0, 1, 2, 3];
      return (
        <g>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff9a4d" />
              <stop offset="1" stopColor="#ffd38a" />
            </linearGradient>
          </defs>
          <rect width="160" height="90" fill="url(#sky)" />
          <circle cx={120 - t * 0.6} cy={30 + t * 0.4} r="9" fill="#fff2c4" />
          {[
            [0, 40, 22], [24, 28, 18], [44, 46, 20], [66, 22, 26], [94, 36, 18], [114, 30, 24], [140, 44, 20],
          ].map(([x, y, w], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={90 - y} fill={`hsl(${hue + i * 6} 25% ${16 + (i % 3) * 5}%)`} />
              {Array.from({ length: Math.floor((70 - y) / 8) }, (_, r) => (
                <rect key={r} x={x + 4} y={y + 5 + r * 8} width={w - 8} height="2.5" fill="#ffd27a" opacity={(Math.sin(i * 3 + r * 7 + Math.floor(t * 2)) + 1) / 2 > 0.5 ? 0.85 : 0.2} />
              ))}
            </g>
          ))}
          <rect y="80" width="160" height="10" fill="#2b2b33" />
          {cars.map((c) => (
            <rect key={c} x={((t * (28 + c * 9) + c * 50) % 200) - 20} y={c % 2 ? 81 : 85} width="12" height="4" rx="1.5" fill={["#e04f4f", "#4f9de0", "#f0c040", "#eee"][c]} />
          ))}
        </g>
      );
    }
    case "cup":
      return (
        <g>
          <rect width="160" height="90" fill="#3a2a22" />
          <rect y="58" width="160" height="32" fill="#7a4e2e" />
          <ellipse cx="80" cy="66" rx="34" ry="6" fill="#5a3820" />
          <path d="M58 40 L62 66 Q80 72 98 66 L102 40 Z" fill="#f2efe9" />
          <path d="M101 45 Q114 46 112 55 Q110 62 99 60" fill="none" stroke="#f2efe9" strokeWidth="4" />
          <ellipse cx="80" cy="40" rx="22" ry="5" fill="#5b3216" />
          {[0, 1, 2].map((i) => {
            const p = (t * 0.6 + i / 3) % 1;
            return <path key={i} d={`M${72 + i * 8} ${36 - p * 26} q4 -5 0 -10 q-4 -5 0 -10`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={(1 - p) * 0.6} />;
          })}
        </g>
      );
    case "sea": {
      const o = (t * 12) % 40;
      return (
        <g>
          <defs>
            <linearGradient id="seaSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7fd0ff" />
              <stop offset="1" stopColor="#d8f1ff" />
            </linearGradient>
          </defs>
          <rect width="160" height="90" fill="url(#seaSky)" />
          <circle cx="40" cy="22" r="8" fill="#fff6c8" />
          <rect y="44" width="160" height="46" fill={`hsl(${hue} 70% 38%)`} />
          {[0, 1, 2, 3].map((r) => (
            <path
              key={r}
              transform={`translate(${-o * (r % 2 ? -1 : 1) - 40} ${48 + r * 10})`}
              d={`M0 0 ${Array.from({ length: 7 }, (_, k) => `q10 -4 20 0 q10 4 20 0`).join(" ")}`}
              fill="none"
              stroke="#bfefff"
              strokeOpacity={0.5 - r * 0.08}
              strokeWidth="1.5"
            />
          ))}
          <path d={`M${20 + t * 4} 60 l10 0 l-2 4 l-7 0 z M${26 + t * 4} 60 l0 -9 l5 8 z`} fill="#fff" />
        </g>
      );
    }
    case "title": {
      const p = Math.min(1, t / 0.6);
      return (
        <g opacity={p}>
          <rect x="30" y="55" width={100 * p} height="3" fill="#ffc93c" />
          <text x="80" y="50" textAnchor="middle" fontSize="15" fontWeight="900" fill="#fff" style={{ paintOrder: "stroke" }} stroke="#000" strokeOpacity=".35" strokeWidth="2" transform={`translate(0 ${(1 - p) * 6})`}>
            {text}
          </text>
        </g>
      );
    }
    case "logo":
      return (
        <g transform={`translate(128 74) scale(${0.9 + wave(t, 2, 0.04)})`}>
          <circle r="9" fill="#ffc93c" />
          <circle cx="-3" cy="-2" r="1.6" fill="#3a2500" />
          <circle cx="3" cy="-2" r="1.6" fill="#3a2500" />
          <text x="-12" y="3" textAnchor="end" fontSize="7" fontWeight="900" fill="#fff">
            {text}
          </text>
        </g>
      );
    case "sunset": {
      const sh = (k: number) => Math.sin(t * 2 + k * 1.7);
      return (
        <g>
          <defs>
            <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a2a5c" />
              <stop offset=".55" stopColor="#c46a6a" />
              <stop offset="1" stopColor="#f6b26b" />
            </linearGradient>
            <linearGradient id="ssea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a3560" />
              <stop offset="1" stopColor="#1f1838" />
            </linearGradient>
            <radialGradient id="ssun">
              <stop offset=".6" stopColor="#fff6e0" />
              <stop offset="1" stopColor="#fff6e0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="160" height="50" fill="url(#ssky)" />
          <circle cx="80" cy={36 + t * 0.15} r="9" fill="url(#ssun)" />
          <circle cx="80" cy={36 + t * 0.15} r="22" fill="#ffd9a0" opacity=".18" />
          <rect y="50" width="160" height="40" fill="url(#ssea)" />
          {Array.from({ length: 9 }, (_, k) => (
            <rect key={k} x={80 - (12 - k) * (0.8 + 0.2 * sh(k))} y={52 + k * 4} width={(12 - k) * 2 * (0.8 + 0.2 * sh(k))} height="1.2" fill="#ffd9a0" opacity={0.75 - k * 0.07} />
          ))}
        </g>
      );
    }
    case "greenscreen": {
      const x = 80 + Math.sin(t * 0.8) * 30;
      const wave = Math.sin(t * 6) * 18;
      return (
        <g>
          <rect width="160" height="90" fill="#00b140" />
          <g transform={`translate(${x} 52)`}>
            <ellipse cx="0" cy="26" rx="18" ry="16" fill="#8f97a6" />
            <g transform={`rotate(${-30 + wave} 14 18)`}>
              <rect x="13" y="2" width="5" height="18" rx="2.5" fill="#8f97a6" />
            </g>
            <circle cx="-15" cy="-16" r="9" fill="#a3abb8" />
            <circle cx="15" cy="-16" r="9" fill="#a3abb8" />
            <circle cx="-15" cy="-16" r="5" fill="#f2b8c6" />
            <circle cx="15" cy="-16" r="5" fill="#f2b8c6" />
            <ellipse cx="0" cy="0" rx="17" ry="15" fill="#a3abb8" />
            <circle cx="-6" cy="-2" r="2.2" fill="#1b1b1b" />
            <circle cx="6" cy="-2" r="2.2" fill="#1b1b1b" />
            <ellipse cx="0" cy="6" rx="3" ry="2.2" fill="#f28aa5" />
          </g>
        </g>
      );
    }
    case "whoosh":
    case "applause":
    case "music":
      return (
        <g>
          <rect width="160" height="90" fill="#12261b" />
          {Array.from({ length: 40 }, (_, i) => {
            const h = 8 + Math.abs(Math.sin(i * 1.7) * 30 + Math.sin(i * 0.4 + t * 3) * 10);
            return <rect key={i} x={2 + i * 4} y={45 - h / 2} width="2.5" height={h} fill="#3ecf8e" />;
          })}
        </g>
      );
  }
}
