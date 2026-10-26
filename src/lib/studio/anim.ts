// Motore dei keyframe condiviso da Premiere e After Effects: ogni proprietà
// animabile è un elenco di numeri (1 per un valore, 2 per un punto, 3 per un
// colore) con il cronometro acceso o spento, interpolazione per keyframe ed
// espressioni in stile After Effects (time, value, wiggle, loopOut…).

export interface Key {
  id: string;
  t: number;
  v: number[];
  /** Easy Ease in entrata / in uscita (Bézier); se entrambi falsi è lineare */
  easeIn: boolean;
  easeOut: boolean;
  hold: boolean;
  /**
   * Maniglie di velocità (come nell'Editor grafico di After Effects):
   * influenza 0–1 della maniglia e velocità normalizzata (0 = si ferma sul
   * keyframe, 1 = velocità costante). Se mancano si ricavano da easeIn/easeOut.
   */
  inInf?: number;
  outInf?: number;
  inSpd?: number;
  outSpd?: number;
}

export interface Prop {
  value: number[];
  keys: Key[] | null; // null = cronometro spento
  expr?: string;
}

export type KeyKind = "linear" | "ease" | "easeIn" | "easeOut" | "hold";

let n = 0;
export const uid = (p = "id") => `${p}${(++n).toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const prop = (...value: number[]): Prop => ({ value, keys: null });

export const keyKind = (k: Key): KeyKind => (k.hold ? "hold" : k.easeIn && k.easeOut ? "ease" : k.easeIn ? "easeIn" : k.easeOut ? "easeOut" : "linear");

export function withKind(k: Key, kind: KeyKind): Key {
  switch (kind) {
    case "hold":
      return { ...k, hold: true };
    case "ease":
      return { ...k, hold: false, easeIn: true, easeOut: true, inInf: undefined, outInf: undefined, inSpd: undefined, outSpd: undefined };
    case "easeIn":
      return { ...k, hold: false, easeIn: true, inInf: undefined, inSpd: undefined };
    case "easeOut":
      return { ...k, hold: false, easeOut: true, outInf: undefined, outSpd: undefined };
    default:
      return { ...k, hold: false, easeIn: false, easeOut: false, inInf: undefined, outInf: undefined, inSpd: undefined, outSpd: undefined };
  }
}

/** Curva di andamento tra due keyframe: lenta in partenza se a ha l'ease in uscita, lenta in arrivo se b ha l'ease in entrata. */
export function ease(p: number, out: boolean, inn: boolean) {
  if (out && inn) return p * p * (3 - 2 * p);
  if (out) return p * p;
  if (inn) return 1 - (1 - p) * (1 - p);
  return p;
}

/** Maniglie effettive di un keyframe (influenza e velocità normalizzata). */
export const outHandle = (k: Key) => ({ inf: k.outInf ?? 1 / 3, spd: k.outSpd ?? (k.easeOut ? 0 : 1) });
export const inHandle = (k: Key) => ({ inf: k.inInf ?? 1 / 3, spd: k.inSpd ?? (k.easeIn ? 0 : 1) });

/** Bézier temporale tra due keyframe: dal tempo normalizzato p all'avanzamento del valore. */
export function segmentProgress(a: Key, b: Key, p: number) {
  const o = outHandle(a);
  const i = inHandle(b);
  const x1 = Math.min(1, Math.max(0.001, o.inf));
  const y1 = x1 * o.spd;
  const x2 = 1 - Math.min(1, Math.max(0.001, i.inf));
  const y2 = 1 - (1 - x2) * i.spd;
  const bx = (u: number) => 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
  const by = (u: number) => 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  // si cerca u tale che x(u) = p (bisezione: robusta anche con maniglie strane)
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 28; k++) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < p) lo = mid;
    else hi = mid;
  }
  return by((lo + hi) / 2);
}

export function keyedValue(p: Prop, t: number): number[] {
  const ks = p.keys;
  if (!ks || !ks.length) return p.value;
  if (t <= ks[0].t) return ks[0].v;
  const last = ks[ks.length - 1];
  if (t >= last.t) return last.v;
  let i = 0;
  while (i < ks.length - 1 && ks[i + 1].t <= t) i++;
  const a = ks[i];
  const b = ks[i + 1];
  if (a.hold) return a.v;
  const q = segmentProgress(a, b, (t - a.t) / (b.t - a.t));
  return a.v.map((x, d) => x + ((b.v[d] ?? x) - x) * q);
}

// ---- espressioni ----------------------------------------------------------

function noise1(x: number, seed: number) {
  // rumore liscio deterministico (interpolazione di valori pseudo-casuali)
  const h = (i: number) => {
    const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return h(i) * (1 - u) + h(i + 1) * u;
}

export interface ExprCtx {
  time: number;
  /** contesto della composizione (livello, proprietà) per il motore completo */
  host?: unknown;
  index?: number;
  fps?: number;
  width?: number;
  height?: number;
}

const cache = new Map<string, ((...a: unknown[]) => unknown) | null>();

/** Valuta un'espressione: restituisce null se c'è un errore (come la barra gialla di After Effects). */
export function evalExpr(p: Prop, ctx: ExprCtx): { value: number[]; error: string | null } {
  const base = keyedValue(p, ctx.time);
  const code = p.expr?.trim();
  if (!code) return { value: base, error: null };
  let fn = cache.get(code);
  if (fn === undefined) {
    try {
      const body = code.includes("return") ? code : `return (${code.replace(/;\s*$/, "")});`;
      fn = new Function("time", "value", "wiggle", "loopOut", "loopIn", "linear", "ease", "clamp", "index", "thisComp", "random", "Math", "framesToTime", body) as (...a: unknown[]) => unknown;
    } catch {
      fn = null;
    }
    cache.set(code, fn);
  }
  if (!fn) return { value: base, error: "Errore di sintassi nell'espressione" };
  const wiggle = (freq: number, amp: number) => base.map((v, d) => v + noise1(ctx.time * freq, d + 1) * amp);
  const loop = (type = "cycle", dir: "out" | "in") => {
    const ks = p.keys;
    if (!ks || ks.length < 2) return base;
    const t0 = ks[0].t;
    const t1 = ks[ks.length - 1].t;
    const dur = t1 - t0;
    if ((dir === "out" && ctx.time <= t1) || (dir === "in" && ctx.time >= t0)) return base;
    const rel = dir === "out" ? ctx.time - t1 : t0 - ctx.time;
    const cycles = Math.floor(rel / dur);
    let local = rel - cycles * dur;
    if (type === "pingpong" && cycles % 2 === 0) local = dur - local;
    if (type === "offset") {
      const delta = ks[ks.length - 1].v.map((v, d) => v - ks[0].v[d]);
      const off = keyedValue(p, t0 + local);
      return off.map((v, d) => v + delta[d] * (cycles + 1));
    }
    return keyedValue(p, dir === "out" ? t0 + local : t1 - local);
  };
  const lin = (t: number, a: number, b: number, v1: number | number[], v2: number | number[]) => {
    const q = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return Array.isArray(v1) ? v1.map((x, d) => x + ((v2 as number[])[d] - x) * q) : v1 + ((v2 as number) - v1) * q;
  };
  const eas = (t: number, a: number, b: number, v1: number | number[], v2: number | number[]) => lin(a + ease(Math.max(0, Math.min(1, (t - a) / (b - a))), true, true) * (b - a), a, b, v1, v2);
  try {
    const out = fn(
      ctx.time,
      base.length === 1 ? base[0] : base,
      wiggle,
      (type?: string) => loop(type, "out"),
      (type?: string) => loop(type, "in"),
      lin,
      eas,
      (v: number, a: number, b: number) => Math.max(a, Math.min(b, v)),
      ctx.index ?? 1,
      { width: ctx.width ?? 1920, height: ctx.height ?? 1080, frameDuration: 1 / (ctx.fps ?? 30) },
      (a = 1, b?: number) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a)),
      Math,
      (f: number) => f / (ctx.fps ?? 30),
    );
    const arr = Array.isArray(out) ? out.map(Number) : [Number(out)];
    if (arr.some((x) => !Number.isFinite(x))) return { value: base, error: "L'espressione non restituisce un numero" };
    // un numero solo su una proprietà a più dimensioni le imposta tutte
    return { value: base.map((_, d) => arr[d] ?? arr[0]), error: null };
  } catch (e) {
    return { value: base, error: e instanceof Error ? e.message : "Errore nell'espressione" };
  }
}

/** Motore completo delle espressioni (registrato da After Effects): riceve anche la composizione. */
export type ExprEngine = (p: Prop, t: number, ctx: Omit<ExprCtx, "time">) => { value: number[]; error: string | null };
let engine: ExprEngine | null = null;
export const setExpressionEngine = (e: ExprEngine) => {
  engine = e;
};

export function evaluate(p: Prop, t: number, ctx?: Omit<ExprCtx, "time">) {
  if (!p.expr) return { value: keyedValue(p, t), error: null };
  if (engine && ctx?.host) return engine(p, t, ctx);
  return evalExpr(p, { ...ctx, time: t });
}

export const valueAt = (p: Prop, t: number, ctx?: Omit<ExprCtx, "time">) => (p.expr ? evaluate(p, t, ctx).value : keyedValue(p, t));

// ---- modifiche --------------------------------------------------------------

const sortKeys = (ks: Key[]) => [...ks].sort((a, b) => a.t - b.t);
const snapT = (t: number, fps: number) => Math.round(t * fps) / fps;

/** Imposta il valore: con il cronometro acceso crea o aggiorna il keyframe all'istante t. */
export function setAt(p: Prop, v: number[], t: number, fps: number): Prop {
  if (!p.keys) return { ...p, value: v };
  const tf = snapT(t, fps);
  const at = p.keys.find((k) => Math.abs(k.t - tf) < 0.5 / fps);
  const keys = at ? p.keys.map((k) => (k === at ? { ...k, v } : k)) : sortKeys([...p.keys, { id: uid("k"), t: tf, v, easeIn: false, easeOut: false, hold: false }]);
  return { ...p, keys };
}

export function toggleStopwatch(p: Prop, t: number, fps: number): Prop {
  if (p.keys) return { ...p, value: keyedValue(p, t), keys: null };
  return { ...p, keys: [{ id: uid("k"), t: snapT(t, fps), v: p.value, easeIn: false, easeOut: false, hold: false }] };
}

/** Aggiunge un keyframe col valore corrente (o lo toglie se ce n'è già uno lì). */
export function toggleKeyAt(p: Prop, t: number, fps: number): Prop {
  const tf = snapT(t, fps);
  const existing = p.keys?.find((k) => Math.abs(k.t - tf) < 0.5 / fps);
  if (existing) {
    const keys = p.keys!.filter((k) => k !== existing);
    return keys.length ? { ...p, keys } : { ...p, value: existing.v, keys: null };
  }
  const v = keyedValue(p, t);
  return setAt(p.keys ? p : { ...p, keys: [] }, v, t, fps);
}

export function mapKeys(p: Prop, fn: (k: Key) => Key | null): Prop {
  if (!p.keys) return p;
  const keys = sortKeys(p.keys.flatMap((k) => fn(k) ?? []));
  return keys.length ? { ...p, keys } : { ...p, value: p.keys[0].v, keys: null };
}

export const shiftKeys = (p: Prop, dt: number): Prop => (p.keys ? { ...p, keys: p.keys.map((k) => ({ ...k, t: k.t + dt })) } : p);

export const keyTimes = (p: Prop) => p.keys?.map((k) => k.t) ?? [];

export const isAnimated = (p: Prop) => !!p.keys || !!p.expr;

/** Copia profonda con nuovi id dei keyframe (per duplica e incolla). */
export const cloneProp = (p: Prop): Prop => ({ ...p, value: [...p.value], keys: p.keys?.map((k) => ({ ...k, id: uid("k"), v: [...k.v] })) ?? null });
