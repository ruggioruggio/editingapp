import { brand } from "@/config/brand";

export type MascotMood = "happy" | "sleepy" | "wow";

/** Placeholder vettoriale della mascotte (topo). Da sostituire con l'illustrazione definitiva. */
export function Mascot({
  size = 64,
  mood = "happy",
  className,
}: {
  size?: number;
  mood?: MascotMood;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={brand.mascotName}>
      <circle cx="24" cy="30" r="20" fill="#8e97ab" />
      <circle cx="24" cy="30" r="12" fill="#f5a3b8" />
      <circle cx="76" cy="30" r="20" fill="#8e97ab" />
      <circle cx="76" cy="30" r="12" fill="#f5a3b8" />
      <ellipse cx="50" cy="58" rx="35" ry="31" fill="#b9c1d0" />
      <ellipse cx="50" cy="70" rx="20" ry="13" fill="#d7dce6" />

      {mood === "sleepy" ? (
        <g stroke="#151515" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M31 53 Q37 57 43 53" />
          <path d="M57 53 Q63 57 69 53" />
        </g>
      ) : (
        <g>
          <circle cx="37" cy="52" r={mood === "wow" ? 7 : 5.5} fill="#151515" />
          <circle cx="63" cy="52" r={mood === "wow" ? 7 : 5.5} fill="#151515" />
          <circle cx="39" cy="50" r="1.8" fill="#fff" />
          <circle cx="65" cy="50" r="1.8" fill="#fff" />
        </g>
      )}

      <circle cx="29" cy="64" r="5" fill="#f5a3b8" opacity="0.55" />
      <circle cx="71" cy="64" r="5" fill="#f5a3b8" opacity="0.55" />
      <ellipse cx="50" cy="64" rx="5" ry="3.6" fill="#ff6f9a" />

      {mood === "wow" ? (
        <ellipse cx="50" cy="73" rx="3.5" ry="4.5" fill="#3a1f2a" />
      ) : mood === "sleepy" ? (
        <path d="M46 72 L54 72" stroke="#151515" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M44 70 Q50 76 56 70" stroke="#151515" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      )}

      <g stroke="#7d8597" strokeWidth="1.4" strokeLinecap="round">
        <path d="M22 64 L8 61" />
        <path d="M22 68 L8 70" />
        <path d="M78 64 L92 61" />
        <path d="M78 68 L92 70" />
      </g>

      {mood === "sleepy" && (
        <text x="82" y="18" fontSize="14" fontWeight="700" fill="#9999ff">
          z
        </text>
      )}
    </svg>
  );
}
