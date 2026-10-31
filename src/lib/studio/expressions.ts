import { parse } from "acorn";
import { generate } from "astring";
import { keyedValue, setExpressionEngine, type ExprCtx, type Key, type Prop } from "./anim";
import { getEffect } from "./effects";
import { getProp, layerProps, type AeProject, type Comp, type Layer } from "./ae";

export interface ExprHost {
  project: AeProject;
  comp: Comp;
  layerId: string;
  path: string;
}

type Vec = number[];
type Val = number | Vec;

const OPS: Record<string, string> = { "+": "__add", "-": "__sub", "*": "__mul", "/": "__div", "%": "__mod" };
type Node = { type: string; [k: string]: unknown };

function rewrite(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(rewrite);
  if (!node || typeof node !== "object") return node;
  const n = node as Node;
  for (const k of Object.keys(n)) if (k !== "type" && typeof n[k] === "object") n[k] = rewrite(n[k]);
  if (n.type === "BinaryExpression" && OPS[n.operator as string]) {
    return { type: "CallExpression", callee: { type: "Identifier", name: OPS[n.operator as string] }, arguments: [n.left, n.right], optional: false };
  }
  if (n.type === "UnaryExpression" && n.operator === "-") {
    return { type: "CallExpression", callee: { type: "Identifier", name: "__neg" }, arguments: [n.argument], optional: false };
  }
  if (n.type === "AssignmentExpression" && ["+=", "-=", "*=", "/="].includes(n.operator as string)) {
    const op = (n.operator as string)[0];
    return { ...n, operator: "=", right: { type: "CallExpression", callee: { type: "Identifier", name: OPS[op] }, arguments: [n.left, n.right], optional: false } };
  }
  return n;
}

const compiled = new Map<string, { src: string } | { error: string }>();
function compile(code: string) {
  let c = compiled.get(code);
  if (!c) {
    try {
      const ast = parse(code, { ecmaVersion: "latest", sourceType: "script", allowReturnOutsideFunction: true });
      c = { src: generate(rewrite(ast) as never) };
    } catch (e) {
      c = { error: `Errore di sintassi: ${e instanceof Error ? e.message.replace(/\s*\(\d+:\d+\)$/, "") : "codice non valido"}` };
    }
    compiled.set(code, c);
  }
  return c;
}

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const RUN = new Function("__scope", "__src", "with (__scope) { return eval(__src); }") as (scope: object, src: string) => unknown;

const GLOBALS = new Set(["Math", "Number", "String", "Array", "Object", "JSON", "Boolean", "Date", "parseInt", "parseFloat", "isNaN", "isFinite", "NaN", "Infinity", "undefined", "eval", "__scope", "__src", "console"]);

class PropRef {
  constructor(
    readonly host: ExprHost,
    readonly layer: Layer,
    readonly path: string,
    readonly p: Prop,
    readonly label: string,
  ) {}
}

const unwrap = (x: unknown): unknown => (x instanceof PropRef ? propValue(x, currentTime()) : x && typeof x === "object" && "__prop" in (x as object) ? unwrap((x as { __prop: PropRef }).__prop) : x);
const num = (x: unknown) => (typeof x === "number" ? x : typeof x === "boolean" ? Number(x) : Number(x));
const isVec = (x: unknown): x is Vec => Array.isArray(x);
const scalarize = (v: Vec): Val => (v.length === 1 ? v[0] : v);

function binop(a0: unknown, b0: unknown, f: (x: number, y: number) => number, concat = false): unknown {
  const a = unwrap(a0);
  const b = unwrap(b0);
  if (concat && (typeof a === "string" || typeof b === "string")) return String(a) + String(b);
  if (isVec(a) && isVec(b)) {
    const n = Math.max(a.length, b.length);
    return Array.from({ length: n }, (_, i) => f(num(a[i] ?? 0), num(b[i] ?? 0)));
  }
  if (isVec(a)) return a.map((x) => f(num(x), num(b)));
  if (isVec(b)) return b.map((y) => f(num(a), num(y)));
  return f(num(a), num(b));
}

const vadd = (a: unknown, b: unknown) => binop(a, b, (x, y) => x + y, true);
const vsub = (a: unknown, b: unknown) => binop(a, b, (x, y) => x - y);
const vmul = (a: unknown, b: unknown) => binop(a, b, (x, y) => x * y);
const vdiv = (a: unknown, b: unknown) => binop(a, b, (x, y) => x / y);
const vmod = (a: unknown, b: unknown) => binop(a, b, (x, y) => x % y);
const vneg = (a: unknown) => {
  const v = unwrap(a);
  return isVec(v) ? v.map((x) => -num(x)) : -num(v);
};
const toVec = (x: unknown): Vec => {
  const v = unwrap(x);
  return isVec(v) ? v.map(num) : [num(v)];
};
const vlength = (a: unknown, b?: unknown) => {
  const v = b === undefined ? toVec(a) : toVec(vsub(b, a));
  return Math.hypot(...v);
};

function hash(n: number) {
  let x = Math.imul(n | 0, 0x9e3779b1) ^ 0x85ebca6b;
  x ^= x >>> 15;
  x = Math.imul(x, 0x2c1b3c6d);
  x ^= x >>> 12;
  x = Math.imul(x, 0x297a2d39);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}
function grad(i: number, seed: number) {
  return hash(i * 7919 + seed * 104729) * 2 - 1;
}
function perlin(x: number, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  const a = grad(i, seed) * f;
  const b = grad(i + 1, seed) * (f - 1);
  return (a + (b - a) * u) * 2;
}
function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let depth = 0;
let timeStack: number[] = [];
const currentTime = () => timeStack[timeStack.length - 1] ?? 0;

const PROP_NAMES: Record<string, string> = {
  position: "t.position",
  scale: "t.scale",
  rotation: "t.rotation",
  zRotation: "t.rotation",
  xRotation: "t.rotX",
  yRotation: "t.rotY",
  opacity: "t.opacity",
  anchorPoint: "t.anchor",
  audioLevels: "a.level",
};

function propValue(r: PropRef, t: number): Val {
  if (depth > 12) throw new Error("Riferimento circolare tra espressioni");
  if (!r.p.expr) return scalarize(keyedValue(r.p, t));
  return scalarize(runExpression(r.p, t, { project: r.host.project, comp: r.host.comp, layerId: r.layer.id, path: r.path }).value);
}

function keyObj(k: Key, i: number) {
  return { time: k.t, value: scalarize(k.v), index: i + 1 };
}

function propObject(r: PropRef): unknown {
  const ks = r.p.keys ?? [];
  const api = {
    __prop: r,
    get value() {
      return propValue(r, currentTime());
    },
    valueAtTime: (t: number) => propValue(r, num(t)),
    velocityAtTime: (t: number) => velocity((x) => propValue(r, x), num(t), r.host.comp.fps),
    speedAtTime: (t: number) => vlength(velocity((x) => propValue(r, x), num(t), r.host.comp.fps)),
    get velocity() {
      return velocity((x) => propValue(r, x), currentTime(), r.host.comp.fps);
    },
    get speed() {
      return vlength(velocity((x) => propValue(r, x), currentTime(), r.host.comp.fps));
    },
    numKeys: ks.length,
    key: (n: number | string) => {
      const k = ks[num(n) - 1];
      if (!k) throw new Error(`Il fotogramma chiave ${n} non esiste`);
      return keyObj(k, num(n) - 1);
    },
    nearestKey: (t: number) => {
      if (!ks.length) throw new Error("La proprietà non ha fotogrammi chiave");
      let best = 0;
      ks.forEach((k, i) => Math.abs(k.t - t) < Math.abs(ks[best].t - t) && (best = i));
      return keyObj(ks[best], best);
    },
    name: r.label,
    propertyIndex: 1,
    valueOf: () => {
      const v = propValue(r, currentTime());
      return isVec(v) ? v[0] : v;
    },
  };
  return new Proxy(api, {
    get(target, k) {
      if (typeof k === "string" && /^\d+$/.test(k)) {
        const v = propValue(r, currentTime());
        return isVec(v) ? v[Number(k)] : Number(k) === 0 ? v : undefined;
      }
      if (k === "length") {
        const v = propValue(r, currentTime());
        return isVec(v) ? v.length : 1;
      }
      return (target as Record<string | symbol, unknown>)[k];
    },
  });
}

function velocity(f: (t: number) => Val, t: number, fps: number): Val {
  const h = 0.5 / fps;
  const a = f(t - h);
  const b = f(t + h);
  return isVec(a) ? a.map((x, i) => ((b as Vec)[i] - x) / (2 * h)) : ((b as number) - a) / (2 * h);
}

function effectLookup(l: Layer, host: ExprHost, which: unknown) {
  const idx = typeof which === "number" ? which - 1 : l.effects.findIndex((e) => {
    const d = getEffect(e.defId);
    const w = String(which).toLowerCase();
    return d && (d.name.toLowerCase() === w || (d.aliases ?? []).some((a) => a.toLowerCase() === w) || e.defId === which);
  });
  const fx = l.effects[idx];
  if (!fx) throw new Error(`Effetto "${which}" non trovato sul livello "${l.name}"`);
  const def = getEffect(fx.defId)!;
  return (param: unknown) => {
    const pi = typeof param === "number" ? param - 1 : def.params.findIndex((p) => {
      const w = String(param).toLowerCase();
      return p.name.toLowerCase() === w || p.id.toLowerCase() === w || (p.aliases ?? []).some((a) => a.toLowerCase() === w);
    });
    const pd = def.params[pi];
    if (!pd) throw new Error(`Parametro "${param}" non trovato in "${def.name}"`);
    return propObject(new PropRef(host, l, `e.${idx}.${pd.id}`, fx.params[pd.id], pd.name));
  };
}

function layerObject(host: ExprHost, l: Layer): Record<string, unknown> {
  const comp = host.comp;
  const pr = (path: string, label: string) => {
    const p = getProp(l, path);
    return p ? propObject(new PropRef(host, l, path, p, label)) : undefined;
  };
  const transform = {
    position: pr("t.position", "Posizione"),
    scale: pr("t.scale", "Scala"),
    rotation: pr("t.rotation", "Rotazione"),
    zRotation: pr("t.rotation", "Rotazione Z"),
    xRotation: pr("t.rotX", "Rotazione X"),
    yRotation: pr("t.rotY", "Rotazione Y"),
    opacity: pr("t.opacity", "Opacità"),
    anchorPoint: pr("t.anchor", "Punto di ancoraggio"),
  };
  const index = comp.layers.indexOf(l) + 1;
  return {
    name: l.name,
    index,
    inPoint: l.inPoint,
    outPoint: l.outPoint,
    startTime: l.startTime,
    width: l.w,
    height: l.h,
    enabled: l.visible,
    active: currentTime() >= l.inPoint && currentTime() < l.outPoint,
    hasVideo: l.type !== "null",
    hasAudio: l.audio,
    hasParent: !!l.parent,
    get parent() {
      const p = l.parent ? comp.layers.find((x) => x.id === l.parent) : undefined;
      if (!p) throw new Error("Questo livello non ha un genitore");
      return layerObject(host, p);
    },
    transform,
    ...transform,
    audioLevels: pr("a.level", "Livelli audio"),
    effect: (which: unknown) => effectLookup(l, host, which),
    text: { sourceText: l.text ?? "" },
    marker: { numKeys: 0 },
    sourceRectAtTime: () => ({ top: -l.h / 2, left: -l.w / 2, width: l.w, height: l.h }),
    toComp: (p: unknown) => toVec(p),
    fromComp: (p: unknown) => toVec(p),
    toWorld: (p: unknown) => toVec(p),
    fromWorld: (p: unknown) => toVec(p),
    sampleImage: () => [0.5, 0.5, 0.5, 1],
  };
}

function compObject(host: ExprHost, comp: Comp): Record<string, unknown> {
  const h = { ...host, comp };
  return {
    name: comp.name,
    width: comp.width,
    height: comp.height,
    duration: comp.duration,
    frameDuration: 1 / comp.fps,
    numLayers: comp.layers.length,
    bgColor: [0, 0, 0, 1],
    pixelAspect: 1,
    displayStartTime: 0,
    layer: (which: unknown) => {
      const l = typeof which === "number" ? comp.layers[which - 1] : comp.layers.find((x) => x.name === String(which));
      if (!l) throw new Error(`Livello "${which}" non trovato nella composizione`);
      return layerObject(h, l);
    },
  };
}

function interp(kind: "linear" | "ease" | "easeIn" | "easeOut", args: unknown[]) {
  let t = num(unwrap(args[0]));
  let tMin = 0;
  let tMax = 1;
  let v1: unknown;
  let v2: unknown;
  if (args.length >= 5) [tMin, tMax, v1, v2] = [num(unwrap(args[1])), num(unwrap(args[2])), unwrap(args[3]), unwrap(args[4])];
  else [v1, v2] = [unwrap(args[1]), unwrap(args[2])];
  if (tMax < tMin) {
    [tMin, tMax] = [tMax, tMin];
    [v1, v2] = [v2, v1];
  }
  let p = tMax === tMin ? (t >= tMax ? 1 : 0) : (Math.min(Math.max(t, tMin), tMax) - tMin) / (tMax - tMin);
  if (kind === "ease") p = p * p * (3 - 2 * p);
  if (kind === "easeIn") p = p * p;
  if (kind === "easeOut") p = 1 - (1 - p) * (1 - p);
  t = p;
  return vadd(v1, vmul(vsub(v2, v1), t));
}

function rgbToHsl(c: unknown) {
  const [r, g, b, a = 1] = toVec(c);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l, a];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l, a];
}
function hslToRgb(c: unknown) {
  const [h, s, l, a = 1] = toVec(c);
  if (!s) return [l, l, l, a];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    t = (t + 1) % 1;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3), a];
}

function loop(p: Prop, t: number, dir: "in" | "out", type: string, n: number, durationMode: number | null): Val {
  const ks = p.keys;
  const base = scalarize(keyedValue(p, t));
  if (!ks || ks.length < 2) return base;
  const first = ks[0];
  const last = ks[ks.length - 1];
  let a = dir === "out" ? ks[Math.max(0, ks.length - 1 - (n > 0 ? n : ks.length - 1))] : first;
  let b = dir === "out" ? last : ks[Math.min(ks.length - 1, n > 0 ? n : ks.length - 1)];
  if (durationMode !== null && durationMode > 0) {
    if (dir === "out") a = { ...a, t: Math.max(first.t, last.t - durationMode) };
    else b = { ...b, t: Math.min(last.t, first.t + durationMode) };
  }
  const t0 = a.t;
  const t1 = b.t;
  const dur = t1 - t0;
  if (dur <= 0) return base;
  if ((dir === "out" && t <= last.t) || (dir === "in" && t >= first.t)) return base;
  const at = (x: number) => keyedValue(p, x);
  if (type === "continue") {
    const edge = dir === "out" ? last : first;
    const h = 0.01;
    const slope = dir === "out" ? at(edge.t).map((v, i) => (v - at(edge.t - h)[i]) / h) : at(edge.t + h).map((v, i) => (v - at(edge.t)[i]) / h);
    return scalarize(edge.v.map((v, i) => v + slope[i] * (t - edge.t)));
  }
  const rel = dir === "out" ? t - t1 : t0 - t;
  const cycles = Math.floor(rel / dur);
  let local = rel - cycles * dur;
  if (type === "pingpong" && cycles % 2 === 0) local = dur - local;
  if (type === "offset") {
    const delta = at(t1).map((v, i) => v - at(t0)[i]);
    const v = at(dir === "out" ? t0 + local : t1 - local);
    return scalarize(v.map((x, i) => x + delta[i] * (cycles + 1) * (dir === "out" ? 1 : -1)));
  }
  return scalarize(at(dir === "out" ? t0 + local : t1 - local));
}

export function runExpression(p: Prop, t: number, host: ExprHost): { value: number[]; error: string | null } {
  const base = keyedValue(p, t);
  const code = p.expr?.trim();
  if (!code) return { value: base, error: null };
  const c = compile(code);
  if ("error" in c) return { value: base, error: c.error };
  const comp = host.comp;
  const layer = comp.layers.find((l) => l.id === host.layerId);
  if (!layer) return { value: base, error: null };
  const fps = comp.fps;
  const self = new PropRef(host, layer, host.path, p, layerProps(layer).find((x) => x.path === host.path)?.name ?? "Proprietà");
  const ks = p.keys ?? [];
  const selfAt = (x: number) => scalarize(keyedValue(p, x));
  let seed = 0;
  let timeless = false;
  let now = t;
  const frameIndex = () => Math.round(now * fps);
  const rng = () => mulberry(Math.floor(hash(seed * 31 + (timeless ? 0 : frameIndex()) * 7 + comp.layers.indexOf(layer) * 131 + host.path.length * 17) * 4294967296));
  let rand = rng();
  const randomFn = (a?: unknown, b?: unknown) => {
    const r = () => rand();
    if (a === undefined) return r();
    const ua = unwrap(a);
    const ub = unwrap(b);
    if (ub === undefined) return isVec(ua) ? ua.map((x) => r() * num(x)) : r() * num(ua);
    if (isVec(ua) || isVec(ub)) {
      const va = toVec(ua);
      const vb = toVec(ub);
      return va.map((x, i) => x + r() * ((vb[i] ?? 0) - x));
    }
    return num(ua) + r() * (num(ub) - num(ua));
  };
  const gauss = () => {
    const u = Math.max(1e-9, rand());
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 0.3 + 0.5;
  };
  const wiggle = (freq: number, amp: unknown, octaves = 1, ampMult = 0.5, tt?: number) => {
    const at = tt === undefined ? scope.time : num(tt);
    const v = toVec(selfAt(at));
    const ampV = toVec(amp);
    return scalarize(
      v.map((x, d) => {
        let sum = 0;
        let a = 1;
        let f = num(freq);
        for (let o = 0; o < Math.max(1, Math.floor(num(octaves))); o++) {
          sum += perlin(at * f, d * 17 + o * 101 + comp.layers.indexOf(layer) * 7) * a;
          a *= num(ampMult);
          f *= 2;
        }
        return x + sum * (ampV[d] ?? ampV[0]);
      }),
    );
  };
  const scope: Record<string, unknown> & { time: number } = {
    time: t,
    get value() {
      return selfAt(scope.time);
    },
    thisProperty: propObject(self),
    thisLayer: layerObject(host, layer),
    thisComp: compObject(host, comp),
    thisProject: { fullPath: "", numItems: host.project.items.length },
    comp: (name: string) => {
      const c2 = Object.values(host.project.comps).find((x) => x.name === name);
      if (!c2) throw new Error(`Composizione "${name}" non trovata`);
      return compObject(host, c2);
    },
    footage: (name: string) => ({ name, width: 1920, height: 1080, duration: 10, frameDuration: 1 / fps }),
    numKeys: ks.length,
    key: (n: number) => {
      const k = ks[num(n) - 1];
      if (!k) throw new Error(`Il fotogramma chiave ${n} non esiste`);
      return keyObj(k, num(n) - 1);
    },
    nearestKey: (tt: number) => {
      if (!ks.length) throw new Error("La proprietà non ha fotogrammi chiave");
      let best = 0;
      ks.forEach((k, i) => Math.abs(k.t - tt) < Math.abs(ks[best].t - tt) && (best = i));
      return keyObj(ks[best], best);
    },
    valueAtTime: (tt: number) => selfAt(num(tt)),
    velocityAtTime: (tt: number) => velocity(selfAt, num(tt), fps),
    speedAtTime: (tt: number) => vlength(velocity(selfAt, num(tt), fps)),
    get velocity() {
      return velocity(selfAt, scope.time, fps);
    },
    get speed() {
      return vlength(velocity(selfAt, scope.time, fps));
    },
    wiggle,
    temporalWiggle: (freq: number, amp: number, octaves = 1, ampMult = 0.5, tt?: number) => {
      const at = tt === undefined ? scope.time : num(tt);
      let off = 0;
      let a = 1;
      let f = num(freq);
      for (let o = 0; o < Math.max(1, octaves); o++) {
        off += perlin(at * f, 991 + o) * a;
        a *= ampMult;
        f *= 2;
      }
      return selfAt(at + off * num(amp));
    },
    smooth: (width = 0.2, samples = 5, tt?: number) => {
      const at = tt === undefined ? scope.time : num(tt);
      const n = Math.max(1, Math.floor(samples));
      let acc: unknown = 0;
      for (let i = 0; i < n; i++) acc = vadd(acc, selfAt(at - width / 2 + (width * i) / Math.max(1, n - 1)));
      return vdiv(acc, n);
    },
    loopOut: (type = "cycle", n = 0) => loop(p, scope.time, "out", String(type), num(n), null),
    loopIn: (type = "cycle", n = 0) => loop(p, scope.time, "in", String(type), num(n), null),
    loopOutDuration: (type = "cycle", d = 0) => loop(p, scope.time, "out", String(type), 0, num(d)),
    loopInDuration: (type = "cycle", d = 0) => loop(p, scope.time, "in", String(type), 0, num(d)),
    linear: (...a: unknown[]) => interp("linear", a),
    ease: (...a: unknown[]) => interp("ease", a),
    easeIn: (...a: unknown[]) => interp("easeIn", a),
    easeOut: (...a: unknown[]) => interp("easeOut", a),
    add: vadd,
    sub: vsub,
    mul: vmul,
    div: vdiv,
    clamp: (v: unknown, a: unknown, b: unknown) => binop(binop(v, a, Math.max), b, Math.min),
    dot: (a: unknown, b: unknown) => toVec(a).reduce((s, x, i) => s + x * (toVec(b)[i] ?? 0), 0),
    cross: (a: unknown, b: unknown) => {
      const [x1, y1, z1 = 0] = toVec(a);
      const [x2, y2, z2 = 0] = toVec(b);
      return [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2];
    },
    length: vlength,
    normalize: (v: unknown) => {
      const a = toVec(v);
      const l = Math.hypot(...a) || 1;
      return a.map((x) => x / l);
    },
    lookAt: (from: unknown, to: unknown) => {
      const [dx, dy, dz = 0] = toVec(vsub(to, from));
      return [(Math.atan2(-dy, Math.hypot(dx, dz)) * 180) / Math.PI, (Math.atan2(dx, dz) * 180) / Math.PI, 0];
    },
    degreesToRadians: (d: number) => (num(unwrap(d)) * Math.PI) / 180,
    radiansToDegrees: (r: number) => (num(unwrap(r)) * 180) / Math.PI,
    timeToFrames: (tt?: number, f = fps) => Math.floor((tt === undefined ? scope.time : num(tt)) * f),
    framesToTime: (frames: number, f = fps) => num(frames) / f,
    timeToTimecode: (tt?: number) => {
      const fr = Math.round((tt === undefined ? scope.time : num(tt)) * fps);
      const r = Math.round(fps);
      const s = Math.floor(fr / r);
      const p2 = (x: number) => String(x).padStart(2, "0");
      return `${p2(Math.floor(s / 3600))}:${p2(Math.floor(s / 60) % 60)}:${p2(s % 60)}:${p2(fr % r)}`;
    },
    timeToCurrentFormat: (tt?: number) => (scope.timeToTimecode as (x?: number) => string)(tt),
    posterizeTime: (f: number) => {
      scope.time = Math.floor(scope.time * num(f)) / num(f);
      now = scope.time;
      timeStack[timeStack.length - 1] = scope.time;
      rand = rng();
      return f;
    },
    random: randomFn,
    gaussRandom: (a?: unknown, b?: unknown) => {
      const g = gauss();
      if (a === undefined) return g;
      if (b === undefined) return vmul(a, g);
      return vadd(a, vmul(vsub(b, a), g));
    },
    seedRandom: (s: number, tl = false) => {
      seed = num(s);
      timeless = !!tl;
      rand = rng();
    },
    noise: (v: unknown) => {
      const a = toVec(v);
      return perlin(a[0] ?? 0, 3) * 0.5 + (a.length > 1 ? perlin((a[1] ?? 0) + 37.1, 5) * 0.3 : 0) + (a.length > 2 ? perlin((a[2] ?? 0) + 91.7, 9) * 0.2 : 0);
    },
    rgbToHsl,
    hslToRgb,
    hexToRgb: (hex: string) => {
      const h = String(hex).replace("#", "");
      return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
    },
    index: comp.layers.indexOf(layer) + 1,
    name: layer.name,
    inPoint: layer.inPoint,
    outPoint: layer.outPoint,
    startTime: layer.startTime,
    width: layer.w,
    height: layer.h,
    effect: (which: unknown) => effectLookup(layer, host, which),
    __add: vadd,
    __sub: vsub,
    __mul: vmul,
    __div: vdiv,
    __mod: vmod,
    __neg: vneg,
  };
  for (const [k, path] of Object.entries(PROP_NAMES)) {
    const pp = getProp(layer, path);
    if (pp) scope[k] = propObject(new PropRef(host, layer, path, pp, k));
  }
  scope.transform = (scope.thisLayer as Record<string, unknown>).transform;

  const proxy = new Proxy(scope, {
    has: (_t, k) => typeof k === "string" && !GLOBALS.has(k),
    get: (target, k) => {
      if (k === Symbol.unscopables) return undefined;
      if (typeof k === "string" && k in target) return target[k];
      return (globalThis as Record<string | symbol, unknown>)[k];
    },
    set: (target, k, v) => {
      if (typeof k === "string") target[k] = v;
      return true;
    },
  });

  depth++;
  timeStack.push(t);
  try {
    let out = unwrap(RUN(proxy, c.src));
    if (out === undefined) return { value: base, error: "L'espressione non restituisce un valore (l'ultima riga deve essere il risultato)" };
    if (typeof out === "boolean") out = Number(out);
    if (typeof out === "string") return { value: base, error: null };
    const arr = isVec(out) ? out.map((x) => num(unwrap(x))) : [num(out)];
    if (arr.some((x) => !Number.isFinite(x))) return { value: base, error: "L'espressione restituisce un valore non numerico" };
    return { value: base.map((_, d) => arr[d] ?? (arr.length === 1 ? arr[0] : base[d])), error: null };
  } catch (e) {
    return { value: base, error: e instanceof Error ? e.message : String(e) };
  } finally {
    depth--;
    timeStack.pop();
    if (!timeStack.length) timeStack = [];
  }
}

setExpressionEngine((p: Prop, t: number, ctx: Omit<ExprCtx, "time">) => runExpression(p, t, ctx.host as ExprHost));
