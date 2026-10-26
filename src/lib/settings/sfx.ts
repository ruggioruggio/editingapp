import { useSettings, type SfxCategory } from "./store";

// Effetti sonori sintetizzati con WebAudio: niente file da scaricare, e
// ogni categoria ha il suo volume nelle impostazioni.

type Note = { f: number; at: number; len: number; type?: OscillatorType; gain?: number; slide?: number };

const SOUNDS: Record<SfxCategory, Note[]> = {
  // "ding-ding" brillante come in Duolingo
  correct: [
    { f: 880, at: 0, len: 0.12, type: "triangle" },
    { f: 1318.5, at: 0.09, len: 0.22, type: "triangle" },
  ],
  // tonfo morbido verso il basso
  wrong: [
    { f: 330, at: 0, len: 0.16, type: "square", gain: 0.35, slide: 260 },
    { f: 247, at: 0.13, len: 0.24, type: "square", gain: 0.35, slide: 196 },
  ],
  // fanfara di fine lezione
  victory: [
    { f: 523.3, at: 0, len: 0.14, type: "triangle" },
    { f: 659.3, at: 0.12, len: 0.14, type: "triangle" },
    { f: 784, at: 0.24, len: 0.14, type: "triangle" },
    { f: 1046.5, at: 0.36, len: 0.45, type: "triangle" },
    { f: 784, at: 0.36, len: 0.45, type: "sine", gain: 0.5 },
  ],
  defeat: [
    { f: 392, at: 0, len: 0.25, type: "sawtooth", gain: 0.25 },
    { f: 349.2, at: 0.22, len: 0.25, type: "sawtooth", gain: 0.25 },
    { f: 311.1, at: 0.44, len: 0.6, type: "sawtooth", gain: 0.25, slide: 280 },
  ],
  // fiammata: glissando verso l'alto
  streak: [
    { f: 300, at: 0, len: 0.35, type: "sawtooth", gain: 0.2, slide: 1200 },
    { f: 1200, at: 0.3, len: 0.3, type: "triangle", gain: 0.6 },
    { f: 1600, at: 0.42, len: 0.35, type: "triangle", gain: 0.5 },
  ],
  levelUp: [
    { f: 587.3, at: 0, len: 0.1, type: "square", gain: 0.3 },
    { f: 784, at: 0.08, len: 0.1, type: "square", gain: 0.3 },
    { f: 987.8, at: 0.16, len: 0.1, type: "square", gain: 0.3 },
    { f: 1174.7, at: 0.24, len: 0.4, type: "triangle" },
  ],
  quest: [
    { f: 1046.5, at: 0, len: 0.08, type: "sine" },
    { f: 1568, at: 0.07, len: 0.25, type: "sine" },
  ],
  ui: [{ f: 660, at: 0, len: 0.05, type: "sine", gain: 0.4 }],
};

let ctx: AudioContext | null = null;

/** Suona l'effetto della categoria al volume scelto dall'utente. */
export function sfx(cat: SfxCategory) {
  if (typeof window === "undefined") return;
  const { master, volumes } = useSettings.getState();
  const vol = master * (volumes[cat] ?? 0.8);
  if (vol <= 0.001) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime + 0.01;
    const out = ctx.createGain();
    out.gain.value = vol * 0.3;
    out.connect(ctx.destination);
    for (const n of SOUNDS[cat]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = n.type ?? "sine";
      o.frequency.setValueAtTime(n.f, now + n.at);
      if (n.slide) o.frequency.exponentialRampToValueAtTime(n.slide, now + n.at + n.len);
      g.gain.setValueAtTime(0, now + n.at);
      g.gain.linearRampToValueAtTime(n.gain ?? 1, now + n.at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + n.at + n.len);
      o.connect(g).connect(out);
      o.start(now + n.at);
      o.stop(now + n.at + n.len + 0.05);
    }
  } catch {
    /* audio non disponibile */
  }
}
