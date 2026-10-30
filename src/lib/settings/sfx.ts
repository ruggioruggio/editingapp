import { useSettings, type SfxCategory } from "./store";

type Note = { f: number; at: number; len: number; type?: OscillatorType; gain?: number; slide?: number; detune?: number };

const SOUNDS: Record<SfxCategory, Note[]> = {
  correct: [
    { f: 523.3, at: 0, len: 0.08, type: "sine", gain: 0.7 },
    { f: 659.3, at: 0.06, len: 0.08, type: "sine", gain: 0.7 },
    { f: 784, at: 0.12, len: 0.18, type: "sine", gain: 0.8 },
  ],
  wrong: [
    { f: 311, at: 0, len: 0.18, type: "triangle", gain: 0.6, slide: 220 },
    { f: 277, at: 0.15, len: 0.28, type: "triangle", gain: 0.5, slide: 185 },
  ],
  victory: [
    { f: 523.3, at: 0, len: 0.12, type: "sine", gain: 0.6 },
    { f: 659.3, at: 0.1, len: 0.12, type: "sine", gain: 0.6 },
    { f: 784, at: 0.2, len: 0.12, type: "sine", gain: 0.7 },
    { f: 1046.5, at: 0.3, len: 0.5, type: "sine", gain: 0.8 },
    { f: 784, at: 0.3, len: 0.5, type: "sine", gain: 0.35 },
    { f: 523.3, at: 0.3, len: 0.5, type: "sine", gain: 0.25 },
  ],
  defeat: [
    { f: 440, at: 0, len: 0.2, type: "triangle", gain: 0.5, slide: 370 },
    { f: 370, at: 0.18, len: 0.2, type: "triangle", gain: 0.5, slide: 311 },
    { f: 311, at: 0.36, len: 0.5, type: "triangle", gain: 0.4, slide: 247 },
  ],
  streak: [
    { f: 440, at: 0, len: 0.1, type: "sine", gain: 0.5 },
    { f: 554.4, at: 0.08, len: 0.1, type: "sine", gain: 0.5 },
    { f: 659.3, at: 0.16, len: 0.1, type: "sine", gain: 0.6 },
    { f: 880, at: 0.24, len: 0.35, type: "sine", gain: 0.7 },
    { f: 1108.7, at: 0.32, len: 0.3, type: "sine", gain: 0.4 },
  ],
  levelUp: [
    { f: 523.3, at: 0, len: 0.08, type: "sine", gain: 0.5 },
    { f: 659.3, at: 0.07, len: 0.08, type: "sine", gain: 0.5 },
    { f: 784, at: 0.14, len: 0.08, type: "sine", gain: 0.6 },
    { f: 1046.5, at: 0.21, len: 0.08, type: "sine", gain: 0.6 },
    { f: 1318.5, at: 0.28, len: 0.4, type: "sine", gain: 0.7 },
    { f: 1046.5, at: 0.28, len: 0.4, type: "sine", gain: 0.3 },
  ],
  quest: [
    { f: 784, at: 0, len: 0.1, type: "sine", gain: 0.6 },
    { f: 988, at: 0.08, len: 0.1, type: "sine", gain: 0.6 },
    { f: 1318.5, at: 0.16, len: 0.25, type: "sine", gain: 0.7 },
  ],
  ui: [
    { f: 880, at: 0, len: 0.06, type: "sine", gain: 0.3 },
  ],
};

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return null; }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

// Ensure AudioContext can start after first user gesture
if (typeof window !== "undefined") {
  const unlock = () => {
    getCtx();
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

export function sfx(cat: SfxCategory) {
  const ac = getCtx();
  if (!ac) return;
  const { master, volumes } = useSettings.getState();
  const vol = master * (volumes[cat] ?? 0.8);
  if (vol <= 0.001) return;
  try {
    const now = ac.currentTime + 0.005;
    const masterGain = ac.createGain();
    masterGain.gain.value = vol;
    masterGain.connect(ac.destination);
    for (const n of SOUNDS[cat]) {
      const osc = ac.createOscillator();
      const env = ac.createGain();
      osc.type = n.type ?? "sine";
      osc.frequency.setValueAtTime(n.f, now + n.at);
      if (n.detune) osc.detune.value = n.detune;
      if (n.slide) osc.frequency.exponentialRampToValueAtTime(n.slide, now + n.at + n.len);
      // ADSR-like envelope: quick attack, sustain, smooth release
      env.gain.setValueAtTime(0, now + n.at);
      env.gain.linearRampToValueAtTime(n.gain ?? 0.7, now + n.at + 0.008);
      env.gain.setValueAtTime(n.gain ?? 0.7, now + n.at + n.len * 0.6);
      env.gain.exponentialRampToValueAtTime(0.001, now + n.at + n.len);
      osc.connect(env).connect(masterGain);
      osc.start(now + n.at);
      osc.stop(now + n.at + n.len + 0.02);
    }
  } catch {
    /* audio unavailable */
  }
}
