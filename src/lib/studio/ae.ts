import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cloneProp, prop, shiftKeys, uid, type Prop } from "./anim";
import type { EffectInstance } from "./effects";
import { SAMPLE_LIBRARY, type Media } from "./media";
import { defaultTextStyle, type TextStyle } from "./text";
import type { MenuItemLike } from "./premiere";

// Motore del simulatore di After Effects: progetto con composizioni e
// metraggio, livelli (metraggio, tinta unita, regolazione, oggetto nullo,
// testo, forma, composizione nidificata), proprietà di trasformazione 2D/3D,
// maschere, effetti, genitori, metodi di fusione ed espressioni.

export type LayerType = "footage" | "solid" | "adjustment" | "null" | "text" | "shape" | "precomp";

export interface Mask {
  id: string;
  name: string;
  mode: "add" | "subtract" | "intersect" | "none";
  inverted: boolean;
  kind: "rect" | "ellipse" | "poly";
  /** rettangolo/ellisse: [x, y, w, h]; poligono: punti x,y in sequenza (spazio del livello) */
  path: number[];
  feather: Prop;
  opacity: Prop;
  expansion: Prop;
}

export interface Shape {
  kind: "rect" | "ellipse" | "star" | "polygon";
  size: Prop;
  roundness: Prop;
  fill: string;
  fillOn: boolean;
  stroke: string;
  strokeOn: boolean;
  strokeWidth: Prop;
  points: number;
}

export interface Transform {
  anchor: Prop;
  position: Prop;
  scale: Prop;
  rotation: Prop;
  rotX: Prop;
  rotY: Prop;
  opacity: Prop;
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  source?: string; // id del media o della composizione
  color: string;
  w: number;
  h: number;
  text?: string;
  textStyle?: TextStyle;
  shape?: Shape;
  inPoint: number;
  outPoint: number;
  startTime: number;
  label: number;
  visible: boolean;
  audio: boolean;
  solo: boolean;
  locked: boolean;
  shy: boolean;
  threeD: boolean;
  motionBlur: boolean;
  fxOn: boolean;
  blend: number;
  parent: string | null;
  transform: Transform;
  effects: EffectInstance[];
  masks: Mask[];
  audioLevel: Prop;
  reversed?: boolean;
  /** animatore di testo: fine dell'intervallo visibile (%) e spaziatura tra le lettere */
  textRange?: Prop;
  tracking?: Prop;
}

export interface Comp {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  bg: string;
  layers: Layer[]; // [0] è il livello in cima
  workIn: number;
  workOut: number;
}

export interface AeItem {
  id: string;
  name: string;
  type: "folder" | "comp" | "footage";
  parent: string | null;
  ref?: string;
  label: number;
}

export interface AeProject {
  name: string;
  items: AeItem[];
  media: Record<string, Media>;
  comps: Record<string, Comp>;
}

export const AE_LABELS: [string, string][] = [
  ["Nessuno", "#5a5a5a"],
  ["Rosso", "#b53838"],
  ["Giallo", "#e4d84c"],
  ["Acqua", "#a9cbc7"],
  ["Rosa", "#e5bcc9"],
  ["Lavanda", "#a9a9ca"],
  ["Pesca", "#e7c19e"],
  ["Spuma di mare", "#b3c7b3"],
  ["Blu", "#677de0"],
  ["Verde", "#4aa44c"],
  ["Viola", "#8e2c9a"],
  ["Arancione", "#e8920d"],
  ["Marrone", "#7f452a"],
  ["Fucsia", "#f46dd6"],
  ["Ciano", "#3da2a5"],
  ["Sabbia", "#a89677"],
  ["Verde scuro", "#1e401e"],
];

// ---- utilità ------------------------------------------------------------------------

export function newTransform(anchor: number[], position: number[]): Transform {
  return { anchor: prop(...anchor), position: prop(...position), scale: prop(100, 100), rotation: prop(0), rotX: prop(0), rotY: prop(0), opacity: prop(100) };
}

export function makeLayer(type: LayerType, comp: Comp, extra: Partial<Layer> = {}, media?: Media): Layer {
  const cx = comp.width / 2;
  const cy = comp.height / 2;
  const base = {
    id: uid("ly"),
    inPoint: 0,
    outPoint: comp.duration,
    startTime: 0,
    visible: true,
    audio: false,
    solo: false,
    locked: false,
    shy: false,
    threeD: false,
    motionBlur: false,
    fxOn: true,
    blend: 0,
    parent: null,
    effects: [],
    masks: [],
    audioLevel: prop(0),
    color: "#000000",
  };
  const count = comp.layers.filter((l) => l.type === type).length + 1;
  switch (type) {
    case "footage": {
      const w = media?.width || comp.width;
      const h = media?.height || comp.height;
      return { ...base, name: media?.name ?? "Metraggio", type, source: media?.id, w, h, label: media?.kind === "audio" ? 7 : media?.kind === "image" ? 4 : 3, audio: !!media?.hasAudio, outPoint: media && !media.still ? Math.min(comp.duration, media.duration) : comp.duration, transform: newTransform([w / 2, h / 2], [cx, cy]), ...extra };
    }
    case "solid":
      return { ...base, name: `Tinta unita ${count}`, type, w: comp.width, h: comp.height, color: "#7a3b3b", label: 1, transform: newTransform([cx, cy], [cx, cy]), ...extra };
    case "adjustment":
      return { ...base, name: `Livello di regolazione ${count}`, type, w: comp.width, h: comp.height, color: "#ffffff", label: 5, transform: newTransform([cx, cy], [cx, cy]), ...extra };
    case "null":
      return { ...base, name: `Oggetto nullo ${count}`, type, w: 100, h: 100, label: 1, transform: newTransform([50, 50], [cx, cy]), ...extra };
    case "text":
      return { ...base, name: extra.text ?? "Testo", type, w: 0, h: 0, text: "Testo", textStyle: defaultTextStyle(Math.round(comp.height / 9)), label: 1, transform: newTransform([0, 0], [cx, cy]), ...extra };
    case "shape":
      return {
        ...base,
        name: `Livello forma ${count}`,
        type,
        w: 0,
        h: 0,
        label: 8,
        shape: { kind: "rect", size: prop(300, 300), roundness: prop(0), fill: "#e8920d", fillOn: true, stroke: "#ffffff", strokeOn: false, strokeWidth: prop(4), points: 5 },
        transform: newTransform([0, 0], [cx, cy]),
        ...extra,
      };
    case "precomp":
      return { ...base, name: "Composizione", type, w: comp.width, h: comp.height, label: 6, transform: newTransform([comp.width / 2, comp.height / 2], [cx, cy]), ...extra };
  }
}

export function cloneLayer(l: Layer, patch: Partial<Layer> = {}): Layer {
  const t = l.transform;
  return {
    ...l,
    id: uid("ly"),
    transform: { anchor: cloneProp(t.anchor), position: cloneProp(t.position), scale: cloneProp(t.scale), rotation: cloneProp(t.rotation), rotX: cloneProp(t.rotX), rotY: cloneProp(t.rotY), opacity: cloneProp(t.opacity) },
    effects: l.effects.map((e) => ({ ...e, id: uid("fx"), params: Object.fromEntries(Object.entries(e.params).map(([k, v]) => [k, cloneProp(v)])) })),
    masks: l.masks.map((m) => ({ ...m, id: uid("mk"), feather: cloneProp(m.feather), opacity: cloneProp(m.opacity), expansion: cloneProp(m.expansion) })),
    shape: l.shape ? { ...l.shape, size: cloneProp(l.shape.size), roundness: cloneProp(l.shape.roundness), strokeWidth: cloneProp(l.shape.strokeWidth) } : undefined,
    textStyle: l.textStyle ? { ...l.textStyle } : undefined,
    audioLevel: cloneProp(l.audioLevel),
    ...patch,
  };
}

/** Tutte le proprietà animabili di un livello, con un percorso stabile (per keyframe, U, grafico…). */
export function layerProps(l: Layer): { path: string; name: string; group: string; prop: Prop }[] {
  const out: { path: string; name: string; group: string; prop: Prop }[] = [];
  const t = l.transform;
  out.push({ path: "t.anchor", name: "Punto di ancoraggio", group: "Trasforma", prop: t.anchor });
  out.push({ path: "t.position", name: "Posizione", group: "Trasforma", prop: t.position });
  out.push({ path: "t.scale", name: "Scala", group: "Trasforma", prop: t.scale });
  if (l.threeD) {
    out.push({ path: "t.rotX", name: "Rotazione X", group: "Trasforma", prop: t.rotX });
    out.push({ path: "t.rotY", name: "Rotazione Y", group: "Trasforma", prop: t.rotY });
    out.push({ path: "t.rotation", name: "Rotazione Z", group: "Trasforma", prop: t.rotation });
  } else out.push({ path: "t.rotation", name: "Rotazione", group: "Trasforma", prop: t.rotation });
  out.push({ path: "t.opacity", name: "Opacità", group: "Trasforma", prop: t.opacity });
  l.masks.forEach((m, i) => {
    out.push({ path: `m.${i}.feather`, name: "Sfumatura maschera", group: m.name, prop: m.feather });
    out.push({ path: `m.${i}.opacity`, name: "Opacità maschera", group: m.name, prop: m.opacity });
    out.push({ path: `m.${i}.expansion`, name: "Espansione maschera", group: m.name, prop: m.expansion });
  });
  if (l.type === "text") {
    out.push({ path: "x.range", name: "Fine intervallo", group: "Animatore testo", prop: l.textRange ?? prop(100) });
    out.push({ path: "x.tracking", name: "Spaziatura", group: "Animatore testo", prop: l.tracking ?? prop(0) });
  }
  if (l.shape) {
    out.push({ path: "s.size", name: "Dimensione", group: "Contenuto", prop: l.shape.size });
    out.push({ path: "s.roundness", name: "Arrotondamento", group: "Contenuto", prop: l.shape.roundness });
    out.push({ path: "s.strokeWidth", name: "Larghezza traccia", group: "Contenuto", prop: l.shape.strokeWidth });
  }
  l.effects.forEach((fx, i) => Object.entries(fx.params).forEach(([k, p]) => out.push({ path: `e.${i}.${k}`, name: k, group: fx.defId, prop: p })));
  if (l.audio) out.push({ path: "a.level", name: "Livelli audio", group: "Audio", prop: l.audioLevel });
  return out;
}

export function getProp(l: Layer, path: string): Prop | undefined {
  return layerProps(l).find((p) => p.path === path)?.prop;
}

/** Sostituisce la proprietà al percorso dato. */
export function withProp(l: Layer, path: string, p: Prop): Layer {
  const [a, b, c] = path.split(".");
  if (a === "t") return { ...l, transform: { ...l.transform, [b]: p } };
  if (a === "m") return { ...l, masks: l.masks.map((m, i) => (i === Number(b) ? { ...m, [c]: p } : m)) };
  if (a === "s" && l.shape) return { ...l, shape: { ...l.shape, [b]: p } };
  if (a === "e") return { ...l, effects: l.effects.map((e, i) => (i === Number(b) ? { ...e, params: { ...e.params, [c]: p } } : e)) };
  if (a === "a") return { ...l, audioLevel: p };
  if (a === "x") return b === "range" ? { ...l, textRange: p } : { ...l, tracking: p };
  return l;
}

export function mapLayerProps(l: Layer, fn: (p: Prop) => Prop): Layer {
  let out = l;
  for (const { path, prop: p } of layerProps(l)) out = withProp(out, path, fn(p));
  return out;
}

export const shiftLayer = (l: Layer, dt: number): Layer => ({ ...mapLayerProps(l, (p) => shiftKeys(p, dt)), inPoint: l.inPoint + dt, outPoint: l.outPoint + dt, startTime: l.startTime + dt });

export function newComp(name: string, width: number, height: number, fps: number, duration: number, bg = "#000000"): Comp {
  return { id: uid("comp"), name, width, height, fps, duration, bg, layers: [], workIn: 0, workOut: duration };
}

// ---- progetto di esempio ------------------------------------------------------------------

function sampleProject(): AeProject {
  const comp = newComp("Composizione 1", 1920, 1080, 30, 6, "#000000");
  const bgL = makeLayer("solid", comp, { name: "Sfondo", color: "#1f1f3d", label: 15 });
  const title = makeLayer("text", comp, { name: "SqueakEdit", text: "SqueakEdit", textStyle: { ...defaultTextStyle(150) }, label: 2 });
  title.transform.position = { value: [960, 600], keys: [{ id: uid("k"), t: 0, v: [960, 1300], easeIn: false, easeOut: true, hold: false }, { id: uid("k"), t: 1.2, v: [960, 600], easeIn: true, easeOut: false, hold: false }] };
  title.transform.opacity = { value: [100], keys: [{ id: uid("k"), t: 0, v: [0], easeIn: false, easeOut: false, hold: false }, { id: uid("k"), t: 0.8, v: [100], easeIn: false, easeOut: false, hold: false }] };
  const ball = makeLayer("shape", comp, { name: "Formaggio", label: 11 });
  ball.shape = { ...ball.shape!, kind: "ellipse", size: prop(180, 180), fill: "#ffc93c" };
  ball.transform.position = prop(960, 330);
  ball.transform.scale = { value: [100, 100], keys: [{ id: uid("k"), t: 0.6, v: [0, 0], easeIn: false, easeOut: true, hold: false }, { id: uid("k"), t: 1.6, v: [100, 100], easeIn: true, easeOut: false, hold: false }] };
  comp.layers = [title, ball, bgL];
  const media: Record<string, Media> = {};
  const items: AeItem[] = [];
  const solids = uid("fold");
  const footage = uid("fold");
  items.push({ id: uid("it"), name: comp.name, type: "comp", parent: null, ref: comp.id, label: 15 });
  items.push({ id: footage, name: "Metraggio", type: "folder", parent: null, label: 2 });
  items.push({ id: solids, name: "Solidi", type: "folder", parent: null, label: 2 });
  for (const m of SAMPLE_LIBRARY.filter((x) => ["s-tramonto", "s-green", "s-musica", "s-logo"].includes(x.id))) {
    const { folder: _f, ...rest } = m;
    void _f;
    media[m.id] = rest;
    items.push({ id: uid("it"), name: m.name, type: "footage", parent: footage, ref: m.id, label: m.kind === "audio" ? 7 : 3 });
  }
  return { name: "Progetto senza titolo", items, media, comps: { [comp.id]: comp } };
}

// ---- store ------------------------------------------------------------------------------

export type AeTool = "select" | "hand" | "zoom" | "rotate" | "anchor" | "rect" | "rrect" | "ellipse" | "polygon" | "star" | "pen" | "text" | "vtext";

export type AeDialog =
  | { type: "comp"; id?: string }
  | { type: "solid"; layerId?: string }
  | { type: "keys" }
  | { type: "rename"; title: string; value: string; onOk: (v: string) => void }
  | { type: "precompose" }
  | { type: "confirm"; title: string; text: string; onOk: () => void };

export interface AeState {
  project: AeProject;
  past: { project: AeProject; label: string }[];
  future: { project: AeProject; label: string }[];
  lastKey: string | null;
  lastAt: number;
  gesture: AeProject | null;
  saved: boolean;

  openComps: string[];
  activeComp: string | null;
  times: Record<string, number>;
  zooms: Record<string, number>;
  playing: boolean;
  selected: string[];
  selectedKeys: string[];
  selectedProps: string[]; // "layerId|path"
  /** proprietà mostrate (twirl) per livello: null = chiuso, "all" = tutto, altrimenti elenco di gruppi/percorsi */
  open: Record<string, string[] | "all">;
  exprOpen: string[];
  tool: AeTool;
  snapping: boolean;
  graph: boolean;
  modes: boolean;
  hideShy: boolean;
  viewerZoom: "fit" | number;
  sourceName: boolean;
  projectSel: string[];
  folder: string | null;
  clipboard: { layers?: Layer[]; keys?: { path: string; keys: { t: number; v: number[] }[] }[] } | null;
  dialog: AeDialog | null;
  menu: { x: number; y: number; items: MenuItemLike[] } | null;
  toast: string | null;
  editingText: string | null;
  maskDraft: { layer: string; pts: number[] } | null;

  commit: (fn: (p: AeProject) => AeProject, label: string, key?: string) => void;
  commitComp: (fn: (c: Comp) => Comp, label: string, key?: string) => void;
  beginGesture: () => void;
  updateGesture: (fn: (c: Comp) => Comp) => void;
  endGesture: (label: string) => void;
  undo: () => void;
  redo: () => void;
  set: (patch: Partial<AeState>) => void;
  notify: (msg: string) => void;
  openComp: (id: string) => void;
  closeComp: (id: string) => void;
  setTime: (t: number) => void;
  reset: () => void;
}

export const compOf = (s: Pick<AeState, "project" | "activeComp">) => (s.activeComp ? s.project.comps[s.activeComp] ?? null : null);
export const timeOf = (s: Pick<AeState, "times" | "activeComp">) => (s.activeComp ? s.times[s.activeComp] ?? 0 : 0);

const initial = sampleProject();
const first = Object.keys(initial.comps)[0];

export const useAe = create<AeState>()(
  persist(
    (set, get) => ({
      project: initial,
      past: [],
      future: [],
      lastKey: null,
      lastAt: 0,
      gesture: null,
      saved: true,

      openComps: [first],
      activeComp: first,
      times: {},
      zooms: {},
      playing: false,
      selected: [],
      selectedKeys: [],
      selectedProps: [],
      open: {},
      exprOpen: [],
      tool: "select",
      snapping: false,
      graph: false,
      modes: false,
      hideShy: false,
      viewerZoom: "fit",
      sourceName: true,
      projectSel: [],
      folder: null,
      clipboard: null,
      dialog: null,
      menu: null,
      toast: null,
      editingText: null,
      maskDraft: null,

      commit: (fn, label, key) => {
        const { project, past, lastKey, lastAt } = get();
        const next = fn(project);
        if (next === project) return;
        const now = Date.now();
        const merge = !!key && key === lastKey && now - lastAt < 1000 && past.length > 0;
        const c = compOf({ project: next, activeComp: get().activeComp });
        const alive = new Set(c?.layers.map((l) => l.id) ?? []);
        set({ project: next, past: merge ? past : [...past, { project, label }].slice(-100), future: [], lastKey: key ?? null, lastAt: now, saved: false, selected: get().selected.filter((id) => alive.has(id)) });
      },
      commitComp: (fn, label, key) => {
        const id = get().activeComp;
        if (!id) return;
        get().commit(
          (p) => {
            const c = p.comps[id];
            const n = fn(c);
            return n === c ? p : { ...p, comps: { ...p.comps, [id]: n } };
          },
          label,
          key,
        );
      },
      beginGesture: () => set({ gesture: get().project }),
      updateGesture: (fn) => {
        const { gesture, activeComp } = get();
        if (!gesture || !activeComp) return;
        set({ project: { ...gesture, comps: { ...gesture.comps, [activeComp]: fn(gesture.comps[activeComp]) } } });
      },
      endGesture: (label) => {
        const { gesture, project, past } = get();
        if (!gesture) return;
        set({ gesture: null, ...(gesture !== project ? { past: [...past, { project: gesture, label }].slice(-100), future: [], saved: false, lastKey: null } : {}) });
      },
      undo: () => {
        const { past, project, future } = get();
        const prev = past.at(-1);
        if (!prev) return;
        set({ project: prev.project, past: past.slice(0, -1), future: [{ project, label: prev.label }, ...future], selectedKeys: [], lastKey: null });
        get().notify(`Annulla ${prev.label}`);
      },
      redo: () => {
        const { past, project, future } = get();
        const [next, ...rest] = future;
        if (!next) return;
        set({ project: next.project, past: [...past, { project, label: next.label }], future: rest, selectedKeys: [], lastKey: null });
        get().notify(`Ripeti ${next.label}`);
      },
      set: (patch) => set(patch),
      notify: (msg) => {
        set({ toast: msg });
        setTimeout(() => get().toast === msg && set({ toast: null }), 2400);
      },
      openComp: (id) => set({ openComps: get().openComps.includes(id) ? get().openComps : [...get().openComps, id], activeComp: id, selected: [], selectedKeys: [], playing: false }),
      closeComp: (id) => {
        const rest = get().openComps.filter((x) => x !== id);
        set({ openComps: rest, activeComp: get().activeComp === id ? rest.at(-1) ?? null : get().activeComp });
      },
      setTime: (t) => {
        const id = get().activeComp;
        const c = id ? get().project.comps[id] : null;
        if (id && c) set({ times: { ...get().times, [id]: Math.max(0, Math.min(c.duration - 1 / c.fps, t)) } });
      },
      reset: () => {
        const p = sampleProject();
        const f = Object.keys(p.comps)[0];
        set({ project: p, past: [], future: [], openComps: [f], activeComp: f, times: {}, selected: [], selectedKeys: [], open: {}, saved: true });
      },
    }),
    {
      name: "studio-ae-v2",
      partialize: (s) => ({ project: s.project, openComps: s.openComps, activeComp: s.activeComp, times: s.times, zooms: s.zooms, sourceName: s.sourceName }),
    },
  ),
);
