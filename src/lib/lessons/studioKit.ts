import { prop, uid, type Key, type Prop } from "@/lib/studio/anim";
import { compOf, getProp, layerProps, makeLayer, newComp, type AeItem, type AeProject, type AeState, type Comp, type Layer } from "@/lib/studio/ae";
import { newEffect } from "@/lib/studio/effects";
import { SAMPLE_LIBRARY, type Media } from "@/lib/studio/media";
import { clipEnd, newClip, newGraphicLayer, newSequence, placeMedia, seqOf, setTransition, videoTracks, audioTracks, type Clip, type PrState, type Project, type ProjectItem, type Sequence } from "@/lib/studio/premiere";

// Attrezzi per scrivere gli esercizi delle lezioni nei simulatori:
// costruttori dei progetti di partenza e controlli sugli obiettivi.

const LIB = Object.fromEntries(SAMPLE_LIBRARY.map(({ folder: _f, ...m }) => (void _f, [m.id, m as Media])));
export const MEDIA = LIB as Record<string, Media>;

// ---- Premiere -------------------------------------------------------------------------

export interface PrClipSpec {
  media: string;
  at: number;
  from?: number;
  to?: number;
  /** traccia video (1 = V1); null = solo audio */
  v?: number | null;
  /** traccia audio (1 = A1); null = solo video */
  a?: number | null;
  /** modifiche alle clip create (video e audio collegati) */
  patch?: Partial<Clip> | ((c: Clip) => Clip);
  /** transizione all'inizio della clip */
  tIn?: string;
}

export interface PrSetupOpts {
  name?: string;
  w?: number;
  h?: number;
  fps?: number;
  clips?: PrClipSpec[];
  markers?: { t: number; name: string }[];
  /** elementi del progetto oltre alla libreria di esempio */
  extraMedia?: Media[];
  /** quali file di esempio mettere nel progetto (predefinito: tutti) */
  media?: string[];
  /** nessuna sequenza aperta (es. per far creare la sequenza all'utente) */
  noSequence?: boolean;
  /** clip da aprire nel monitor sorgente */
  source?: string;
  /** titoli (clip grafiche con un livello di testo) */
  titles?: { at: number; dur: number; v: number; text: string; x?: number; y?: number; size?: number }[];
}

/** Progetto di Premiere preparato per un esercizio. */
export function prSetup(o: PrSetupOpts = {}): Partial<PrState> {
  const media: Record<string, Media> = {};
  const items: ProjectItem[] = [];
  const bins: Record<string, string> = {};
  for (const [folder, name] of [
    ["Video", "Footage"],
    ["Audio", "Audio"],
    ["Grafica", "Graphics"],
  ]) {
    bins[folder] = uid("bin");
    items.push({ id: bins[folder], name, type: "bin", parent: null, label: 7 });
  }
  const wanted = o.media ?? SAMPLE_LIBRARY.map((m) => m.id);
  for (const m of SAMPLE_LIBRARY.filter((x) => wanted.includes(x.id) || o.clips?.some((c) => c.media === x.id))) {
    const { folder, ...rest } = m;
    media[m.id] = rest;
    items.push({ id: uid("it"), name: m.name, type: "media", parent: bins[folder], ref: m.id, label: m.kind === "audio" ? 5 : m.kind === "image" ? 6 : 2 });
  }
  for (const m of o.extraMedia ?? []) {
    media[m.id] = m;
    items.push({ id: uid("it"), name: m.name, type: "media", parent: bins.Grafica, ref: m.id, label: 4 });
  }
  const project: Project = { name: o.name ?? "Esercizio", items, media, sequences: {} };
  if (o.noSequence) {
    return { project, openSeqs: [], activeSeq: null, playheads: {}, source: { mediaId: o.source ?? null, t: 0, in: null, out: null, playing: false } };
  }
  let seq = newSequence(o.name ?? "Esercizio", o.w ?? 1920, o.h ?? 1080, o.fps ?? 25);
  const vt = videoTracks(seq);
  const at = audioTracks(seq);
  for (const c of o.clips ?? []) {
    const m = media[c.media];
    const from = c.from ?? 0;
    const to = c.to ?? m.duration;
    const vIdx = c.v === undefined ? (m.hasVideo ? 1 : null) : c.v;
    const aIdx = c.a === undefined ? (m.hasAudio ? 1 : null) : c.a;
    const r = placeMedia(seq, m, c.at, from, to, "overwrite", vIdx ? vt[vIdx - 1].id : null, aIdx ? at[aIdx - 1].id : null);
    seq = r.seq;
    const p = c.patch;
    if (p) seq = { ...seq, clips: seq.clips.map((x) => (!r.ids.includes(x.id) ? x : typeof p === "function" ? p(x) : { ...x, ...p })) };
    if (c.tIn) {
      const vid = r.ids.find((id) => seq.clips.find((x) => x.id === id && vt.some((t) => t.id === x.track)));
      if (vid) seq = setTransition(seq, vid, "in", c.tIn, 1);
    }
  }
  for (const ti of o.titles ?? []) {
    const m: Media = { id: uid("g"), name: "Grafica", kind: "graphic", duration: 5, width: seq.width, height: seq.height, fps: seq.fps, hasVideo: true, hasAudio: false, still: true };
    media[m.id] = m;
    const layer = newGraphicLayer("text", ti.x ?? seq.width / 2, ti.y ?? seq.height / 2, seq, ti.text);
    if (ti.size) layer.style = { ...layer.style, size: ti.size };
    const track = videoTracks(seq)[ti.v - 1].id;
    seq = { ...seq, clips: [...seq.clips, { ...newClip(m, seq, track, ti.at, 0, ti.dur), name: ti.text, label: 6, graphic: [layer] }] };
  }
  seq.markers = (o.markers ?? []).map((m, i) => ({ id: uid("mk"), t: m.t, name: m.name, color: i % 8, comment: "" }));
  project.sequences[seq.id] = seq;
  items.push({ id: uid("it"), name: seq.name, type: "sequence", parent: null, ref: seq.id, label: 0 });
  return {
    project,
    openSeqs: [seq.id],
    activeSeq: seq.id,
    playheads: { [seq.id]: 0 },
    source: { mediaId: o.source ?? null, t: 0, in: null, out: null, playing: false },
  };
}

/** Sequenza attiva (o null). */
export const prSeq = (s: PrState): Sequence | null => seqOf(s);
const sorted = (cl: Clip[]) => [...cl].sort((a, b) => a.start - b.start);
/** Clip della traccia video n (1 = V1), in ordine di tempo. */
export function vClips(s: PrState, n = 1): Clip[] {
  const q = prSeq(s);
  const t = q ? videoTracks(q)[n - 1] : undefined;
  return q && t ? sorted(q.clips.filter((c) => c.track === t.id)) : [];
}
/** Clip della traccia audio n (1 = A1), in ordine di tempo. */
export function aClips(s: PrState, n = 1): Clip[] {
  const q = prSeq(s);
  const t = q ? audioTracks(q)[n - 1] : undefined;
  return q && t ? sorted(q.clips.filter((c) => c.track === t.id)) : [];
}
export const allClips = (s: PrState): Clip[] => prSeq(s)?.clips ?? [];
export const videoClips = (s: PrState): Clip[] => {
  const q = prSeq(s);
  return q ? q.clips.filter((c) => videoTracks(q).some((t) => t.id === c.track)) : [];
};
export const audioOnly = (s: PrState): Clip[] => {
  const q = prSeq(s);
  return q ? q.clips.filter((c) => audioTracks(q).some((t) => t.id === c.track)) : [];
};
/** C'è un taglio (inizio di una clip) vicino al tempo t sulla traccia video n. */
export const cutNear = (s: PrState, t: number, tol = 0.35, n = 1) => vClips(s, n).some((c) => Math.abs(c.start - t) <= tol && c.start > 0.04);
/** Nessun buco sulla traccia video n: dall'inizio, clip una dopo l'altra. */
export function noGaps(s: PrState, n = 1): boolean {
  const cl = vClips(s, n);
  if (!cl.length || cl[0].start > 0.05) return false;
  return cl.every((c, i) => i === 0 || Math.abs(c.start - clipEnd(cl[i - 1])) < 0.05);
}
/** Durata totale della sequenza (fine dell'ultima clip). */
export const seqLength = (s: PrState) => allClips(s).reduce((m, c) => Math.max(m, clipEnd(c)), 0);
export const hasTransition = (s: PrState, defIds?: string[]) => allClips(s).some((c) => [c.tIn, c.tOut].some((t) => t && (!defIds || defIds.includes(t.defId))));
export const clipEffect = (c: Clip, defId: string) => c.effects.find((e) => e.defId === defId && e.enabled);
export const hasEffect = (s: PrState, defId: string) => allClips(s).some((c) => !!clipEffect(c, defId));
/** Valore di un parametro di un effetto (primo valore, o il valore al primo keyframe). */
export function fxValue(c: Clip, defId: string, param: string): number | null {
  const p = clipEffect(c, defId)?.params[param];
  return p ? (p.keys?.[0]?.v[0] ?? p.value[0]) : null;
}
/** Una clip qualsiasi soddisfa la condizione sul parametro dell'effetto. */
export const anyFx = (s: PrState, defId: string, param: string, ok: (v: number) => boolean) =>
  allClips(s).some((c) => {
    const v = fxValue(c, defId, param);
    return v !== null && ok(v);
  });
export const keyCount = (p: Prop | undefined) => p?.keys?.length ?? 0;
export const anyClip = (s: PrState, ok: (c: Clip) => boolean) => allClips(s).some(ok);
export const markerCount = (s: PrState) => prSeq(s)?.markers.length ?? 0;
/** Volume (dB) di una clip a un tempo della sequenza. */
export { clipVolumeAt } from "@/lib/studio/premiere";
/** Clip di un certo file (video o audio). */
export const clipsOf = (s: PrState, mediaId: string) => allClips(s).filter((c) => c.mediaId === mediaId);
export const isVideo = (s: PrState, c: Clip) => {
  const q = prSeq(s);
  return !!q && videoTracks(q).some((t) => t.id === c.track);
};
/** Tutti i keyframe di movimento/opacità/volume di una clip. */
export const clipProps = (c: Clip): Prop[] => [c.motion.position, c.motion.scale, c.motion.rotation, c.motion.anchor, c.opacity, c.volume];
export const graphicTexts = (s: PrState) => allClips(s).flatMap((c) => c.graphic ?? []).filter((g) => g.kind === "text");

/** Effetto già applicato a una clip della specifica (per partire da un punto preciso). */
export function withFx(defId: string, w = 1920, h = 1080, params: Record<string, number[]> = {}) {
  const e = newEffect(defId, w, h);
  for (const [k, v] of Object.entries(params)) if (e.params[k]) e.params[k] = { ...e.params[k], value: v };
  return e;
}

// ---- After Effects ---------------------------------------------------------------------

export interface AeSetupOpts {
  name?: string;
  w?: number;
  h?: number;
  fps?: number;
  duration?: number;
  bg?: string;
  /** livelli dall'alto in basso */
  layers?: (comp: Comp, media: Record<string, Media>) => Layer[];
  media?: string[];
  /** nessuna composizione aperta */
  noComp?: boolean;
  /** proprietà da mostrare già aperte nella timeline */
  open?: (layers: Layer[]) => Record<string, string[] | "all">;
}

/** Progetto di After Effects preparato per un esercizio. */
export function aeSetup(o: AeSetupOpts = {}): Partial<AeState> {
  const media: Record<string, Media> = {};
  const items: AeItem[] = [];
  const footage = uid("fold");
  items.push({ id: footage, name: "Metraggio", type: "folder", parent: null, label: 2 });
  for (const id of o.media ?? ["s-tramonto", "s-green", "s-drone", "s-musica", "s-logo"]) {
    if (!MEDIA[id]) continue;
    media[id] = MEDIA[id];
    items.push({ id: uid("it"), name: MEDIA[id].name, type: "footage", parent: footage, ref: id, label: MEDIA[id].kind === "audio" ? 7 : 3 });
  }
  const project: AeProject = { name: o.name ?? "Esercizio", items, media, comps: {} };
  if (o.noComp) return { project, openComps: [], activeComp: null, times: {} };
  const comp = newComp(o.name ?? "Composizione 1", o.w ?? 1920, o.h ?? 1080, o.fps ?? 30, o.duration ?? 5, o.bg ?? "#000000");
  comp.layers = o.layers?.(comp, media) ?? [];
  project.comps[comp.id] = comp;
  items.unshift({ id: uid("it"), name: comp.name, type: "comp", parent: null, ref: comp.id, label: 15 });
  return { project, openComps: [comp.id], activeComp: comp.id, times: { [comp.id]: 0 }, open: o.open?.(comp.layers) ?? {} };
}

export const aeLayer = makeLayer;
export const key = (t: number, ...v: number[]): Key => ({ id: uid("k"), t, v, easeIn: false, easeOut: false, hold: false });
export const animated = (keys: Key[]): Prop => ({ value: keys[0].v, keys });
export { prop };

export const aeComp = (s: AeState) => compOf(s);
export const aeLayers = (s: AeState): Layer[] => compOf(s)?.layers ?? [];
export const allComps = (s: AeState): Comp[] => Object.values(s.project.comps);
export const findLayer = (s: AeState, ok: (l: Layer) => boolean) => aeLayers(s).find(ok);
export const aeKeys = (l: Layer | undefined, path: string): Key[] => (l ? getProp(l, path)?.keys ?? [] : []);
/** Qualche livello ha almeno n keyframe sulla proprietà. */
export const anyKeys = (s: AeState, path: string, n = 2, ok?: (l: Layer) => boolean) => aeLayers(s).some((l) => (!ok || ok(l)) && aeKeys(l, path).length >= n);
/** Qualche keyframe della proprietà ha un'andatura non lineare (easy ease o maniglie). */
export const anyEased = (s: AeState, path: string) =>
  aeLayers(s).some((l) => aeKeys(l, path).some((k) => k.easeIn || k.easeOut || (k.outSpd !== undefined && k.outSpd < 0.9) || (k.inSpd !== undefined && k.inSpd < 0.9)));
/** Qualche proprietà (o quella indicata) di qualche livello ha un'espressione che corrisponde. */
export function anyExpr(s: AeState, re: RegExp, path?: string, ok?: (l: Layer) => boolean): boolean {
  return aeLayers(s).some((l) => (!ok || ok(l)) && layerProps(l).some((p) => (!path || p.path === path) && !!p.prop.expr && re.test(p.prop.expr)));
}
/** Primo e ultimo valore (primo canale) dei keyframe di una proprietà. */
export function keyRange(l: Layer | undefined, path: string): { first: number; last: number; min: number; max: number; span: number; n: number } {
  const k = [...aeKeys(l, path)].sort((a, b) => a.t - b.t);
  const v = k.map((x) => x.v[0]);
  return { first: v[0] ?? NaN, last: v[v.length - 1] ?? NaN, min: Math.min(...v), max: Math.max(...v), span: k.length ? k[k.length - 1].t - k[0].t : 0, n: k.length };
}
export const layerFx = (l: Layer, defId: string) => l.effects.find((e) => e.defId === defId);
export const anyLayerFx = (s: AeState, defId: string) => aeLayers(s).some((l) => !!layerFx(l, defId));

/** Clip grafiche con i loro livelli di testo. */
export const graphicLayers = (s: PrState) => allClips(s).flatMap((c) => (c.graphic ?? []).map((g) => ({ clip: c, g })));
/** Tutte le sequenze del progetto. */
export const sequences = (s: PrState) => Object.values(s.project.sequences);
