import { create } from "zustand";

// Motore del simulatore di After Effects: una composizione con livelli di
// testo, forma e tinta unita, proprietà di trasformazione animabili con il
// cronometro, keyframe lineari / Easy Ease / tenuta, annulla e ripeti.

export type PropKey = "anchor" | "position" | "scale" | "rotation" | "opacity";
export const PROP_KEYS: PropKey[] = ["anchor", "position", "scale", "rotation", "opacity"];
export const PROP_LABEL: Record<PropKey, string> = {
  anchor: "Punto di ancoraggio",
  position: "Posizione",
  scale: "Scala",
  rotation: "Rotazione",
  opacity: "Opacità",
};
/** Le lettere di After Effects per mostrare una sola proprietà. */
export const PROP_SHORTCUT: Record<string, PropKey> = { a: "anchor", p: "position", s: "scale", r: "rotation", t: "opacity" };

export type Interp = "linear" | "ease" | "hold";
export interface Key {
  id: string;
  t: number;
  v: number[];
  interp: Interp;
}
export interface Prop {
  value: number[];
  keys: Key[] | null; // null = cronometro spento
}

export type LayerType = "text" | "shape" | "solid";
export interface AeLayer {
  id: string;
  name: string;
  type: LayerType;
  color: string;
  label: string;
  text?: string;
  fontSize?: number;
  shape?: "rect" | "ellipse" | "star";
  size?: [number, number];
  inPoint: number;
  outPoint: number;
  visible: boolean;
  props: Record<PropKey, Prop>;
}

export interface AeComp {
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  bg: string;
  layers: AeLayer[]; // [0] è il livello più in alto
}

export type AeTool = "select" | "hand" | "text" | "rect" | "ellipse";

let n = 0;
const uid = (p: string) => `${p}${++n}${Math.random().toString(36).slice(2, 6)}`;
const LABELS = ["#e8d64a", "#a8a1e6", "#5fbdc4", "#e58ec8", "#a6d36b", "#e89a55", "#8ab4e8"];

export const easeFn = (p: number, outEase: boolean, inEase: boolean) => {
  if (outEase && inEase) return p * p * (3 - 2 * p);
  if (outEase) return p * p;
  if (inEase) return 1 - (1 - p) * (1 - p);
  return p;
};

export function valueAt(prop: Prop, t: number): number[] {
  const ks = prop.keys;
  if (!ks || !ks.length) return prop.value;
  if (t <= ks[0].t) return ks[0].v;
  const last = ks[ks.length - 1];
  if (t >= last.t) return last.v;
  const i = ks.findIndex((k) => k.t > t) - 1;
  const a = ks[i];
  const b = ks[i + 1];
  if (a.interp === "hold") return a.v;
  const p = easeFn((t - a.t) / (b.t - a.t), a.interp === "ease", b.interp === "ease");
  return a.v.map((x, d) => x + (b.v[d] - x) * p);
}

const prop = (value: number[]): Prop => ({ value, keys: null });

export function makeLayer(type: LayerType, comp: Pick<AeComp, "width" | "height" | "duration">, index: number, at?: [number, number], extra?: Partial<AeLayer>): AeLayer {
  const cx = comp.width / 2;
  const cy = comp.height / 2;
  const base = {
    id: uid("ly"),
    label: LABELS[index % LABELS.length],
    inPoint: 0,
    outPoint: comp.duration,
    visible: true,
  };
  if (type === "solid") {
    return {
      ...base,
      name: "Tinta unita " + (index + 1),
      type,
      color: "#3b3b8f",
      props: { anchor: prop([cx, cy]), position: prop([cx, cy]), scale: prop([100, 100]), rotation: prop([0]), opacity: prop([100]) },
      ...extra,
    };
  }
  if (type === "text") {
    return {
      ...base,
      name: extra?.text ?? "Testo",
      type,
      color: "#ffffff",
      text: "Testo",
      fontSize: 120,
      props: { anchor: prop([0, 0]), position: prop(at ?? [cx, cy]), scale: prop([100, 100]), rotation: prop([0]), opacity: prop([100]) },
      ...extra,
    };
  }
  return {
    ...base,
    name: "Livello forma " + (index + 1),
    type,
    color: "#ffc93c",
    shape: "rect",
    size: [300, 300],
    props: { anchor: prop([0, 0]), position: prop(at ?? [cx, cy]), scale: prop([100, 100]), rotation: prop([0]), opacity: prop([100]) },
    ...extra,
  };
}

const starter = (): AeComp => {
  const c = { width: 1920, height: 1080, duration: 6 };
  const title = makeLayer("text", c, 0, undefined, { name: "SqueakEdit", text: "SqueakEdit", fontSize: 150 });
  title.props.position.keys = [
    { id: uid("k"), t: 0, v: [960, 1300], interp: "ease" },
    { id: uid("k"), t: 1.2, v: [960, 600], interp: "ease" },
  ];
  title.props.opacity.keys = [
    { id: uid("k"), t: 0, v: [0], interp: "linear" },
    { id: uid("k"), t: 0.8, v: [100], interp: "linear" },
  ];
  const ball = makeLayer("shape", c, 1, [960, 330], { name: "Formaggio", shape: "ellipse", size: [180, 180] });
  ball.props.scale.keys = [
    { id: uid("k"), t: 0.6, v: [0, 0], interp: "ease" },
    { id: uid("k"), t: 1.6, v: [100, 100], interp: "ease" },
  ];
  const bg = makeLayer("solid", c, 2, undefined, { name: "Sfondo", color: "#1f1f3d" });
  return { name: "Composizione 1", width: 1920, height: 1080, fps: 30, duration: 6, bg: "#000000", layers: [title, ball, bg] };
};

const sortKeys = (ks: Key[]) => [...ks].sort((a, b) => a.t - b.t);

function mapLayer(c: AeComp, id: string, fn: (l: AeLayer) => AeLayer): AeComp {
  return { ...c, layers: c.layers.map((l) => (l.id === id ? fn(l) : l)) };
}

/** Imposta un valore: con il cronometro acceso crea o aggiorna il keyframe all'istante corrente. */
export function setProp(c: AeComp, layerId: string, key: PropKey, v: number[], t: number): AeComp {
  return mapLayer(c, layerId, (l) => {
    const p = l.props[key];
    if (!p.keys) return { ...l, props: { ...l.props, [key]: { ...p, value: v } } };
    const tf = Math.round(t * c.fps) / c.fps;
    const at = p.keys.find((k) => Math.abs(k.t - tf) < 0.5 / c.fps);
    const keys = at ? p.keys.map((k) => (k === at ? { ...k, v } : k)) : sortKeys([...p.keys, { id: uid("k"), t: tf, v, interp: "linear" }]);
    return { ...l, props: { ...l.props, [key]: { ...p, keys } } };
  });
}

export function toggleStopwatch(c: AeComp, layerId: string, key: PropKey, t: number): AeComp {
  return mapLayer(c, layerId, (l) => {
    const p = l.props[key];
    if (p.keys) return { ...l, props: { ...l.props, [key]: { value: valueAt(p, t), keys: null } } };
    const tf = Math.round(t * c.fps) / c.fps;
    return { ...l, props: { ...l.props, [key]: { ...p, keys: [{ id: uid("k"), t: tf, v: p.value, interp: "linear" }] } } };
  });
}

/** Aggiunge un keyframe col valore attuale (anche col rombo del navigatore). */
export function addKey(c: AeComp, layerId: string, key: PropKey, t: number): AeComp {
  const l = c.layers.find((x) => x.id === layerId)!;
  const p = l.props[key];
  const base = p.keys ? c : toggleStopwatch(c, layerId, key, t);
  return p.keys ? setProp(base, layerId, key, valueAt(p, t), t) : base;
}

export function updateKeys(c: AeComp, ids: Set<string>, fn: (k: Key) => Key | null): AeComp {
  return {
    ...c,
    layers: c.layers.map((l) => {
      let touched = false;
      const props = { ...l.props };
      for (const pk of PROP_KEYS) {
        const p = l.props[pk];
        if (!p.keys?.some((k) => ids.has(k.id))) continue;
        touched = true;
        const keys = sortKeys(p.keys.flatMap((k) => (ids.has(k.id) ? (fn(k) ?? []) : [k])));
        props[pk] = keys.length ? { ...p, keys } : { value: p.keys[0].v, keys: null };
      }
      return touched ? { ...l, props } : l;
    }),
  };
}

export const allKeyTimes = (l: AeLayer, only?: PropKey[]) =>
  [...new Set(PROP_KEYS.filter((k) => !only || only.includes(k)).flatMap((k) => l.props[k].keys?.map((x) => x.t) ?? []))].sort((a, b) => a - b);

export const isAnimated = (l: AeLayer, k: PropKey) => !!l.props[k].keys;

// ---------------------------------------------------------------------------

interface AeState {
  comp: AeComp;
  past: AeComp[];
  future: AeComp[];
  lastKey: string | null;
  lastAt: number;
  gesture: AeComp | null;
  time: number;
  playing: boolean;
  selected: string[];
  selectedKeys: string[];
  tool: AeTool;
  /** proprietà mostrate per ogni livello (twirl-down); assente = chiuso */
  open: Record<string, PropKey[]>;
  graph: { layer: string; prop: PropKey } | null;
  pxPerSec: number;
  dialog: null | "keys" | "comp";
  toast: string | null;

  commit: (next: AeComp, key?: string) => void;
  beginGesture: () => void;
  updateGesture: (fn: (base: AeComp) => AeComp) => void;
  endGesture: () => void;
  undo: () => void;
  redo: () => void;
  set: (patch: Partial<AeState>) => void;
  notify: (msg: string) => void;
  reset: () => void;
}

export const useAfterEffects = create<AeState>()((set, get) => ({
  comp: starter(),
  past: [],
  future: [],
  lastKey: null,
  lastAt: 0,
  gesture: null,
  time: 0,
  playing: false,
  selected: [],
  selectedKeys: [],
  tool: "select",
  open: {},
  graph: null,
  pxPerSec: 120,
  dialog: null,
  toast: null,

  commit: (next, key) => {
    const { comp, past, lastKey, lastAt } = get();
    if (next === comp) return;
    const now = Date.now();
    const merge = !!key && key === lastKey && now - lastAt < 1000 && past.length > 0;
    const alive = new Set(next.layers.map((l) => l.id));
    set({ comp: next, past: merge ? past : [...past, comp].slice(-80), future: [], lastKey: key ?? null, lastAt: now, selected: get().selected.filter((id) => alive.has(id)) });
  },
  beginGesture: () => set({ gesture: get().comp }),
  updateGesture: (fn) => {
    const base = get().gesture;
    if (base) set({ comp: fn(base) });
  },
  endGesture: () => {
    const { gesture, comp, past } = get();
    if (!gesture) return;
    set({ gesture: null, ...(gesture !== comp ? { past: [...past, gesture].slice(-80), future: [] } : {}) });
  },
  undo: () => {
    const { past, comp, future } = get();
    const prev = past.at(-1);
    if (prev) set({ comp: prev, past: past.slice(0, -1), future: [comp, ...future], selectedKeys: [], lastKey: null });
  },
  redo: () => {
    const { past, comp, future } = get();
    const [next, ...rest] = future;
    if (next) set({ comp: next, past: [...past, comp], future: rest, selectedKeys: [], lastKey: null });
  },
  set: (patch) => set(patch),
  notify: (msg) => {
    set({ toast: msg });
    setTimeout(() => get().toast === msg && set({ toast: null }), 2200);
  },
  reset: () => set({ comp: starter(), past: [], future: [], selected: [], selectedKeys: [], time: 0, playing: false, open: {} }),
}));
