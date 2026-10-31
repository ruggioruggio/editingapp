import { prop, uid } from "@/lib/studio/anim";
import { getEffect, getTransition, newEffect } from "@/lib/studio/effects";
import { importFile, isStill, type Media, type MediaKind } from "@/lib/studio/media";
import {
  audioTracks,
  clipAt,
  clipDur,
  clipEnd,
  cloneClip,
  closeGap,
  deleteClips,
  isVideoTrack,
  linked,
  liftExtract,
  mediaTime,
  makeTrack,
  moveClips,
  newClip,
  newGraphicLayer,
  newSequence,
  pasteClips,
  placeMedia,
  playheadOf,
  razor,
  seqDuration,
  seqOf,
  setTransition,
  shiftTrack,
  snapFrame,
  trimEdge,
  usePremiere,
  videoTracks,
  type Clip,
  type ProjectItem,
  type PrTool,
  type Sequence,
} from "@/lib/studio/premiere";

const st = () => usePremiere.getState();
const S = () => seqOf(st());
const T = () => playheadOf(st());
const editPoints = (s: Sequence) => [...new Set([0, ...s.clips.flatMap((c) => [c.start, clipEnd(c)])])].sort((a, b) => a - b);

export const DEFAULT_TRANSITION = { video: "cross", audio: "aPower", dur: 1 };

export function needSeq(): Sequence | null {
  const s = S();
  if (!s) st().notify("Apri o crea prima una sequenza");
  return s;
}

export function togglePlay() {
  const s = st();
  const seq = S();
  if (s.focus === "source" && s.source.mediaId) return s.set({ source: { ...s.source, playing: !s.source.playing }, playing: false });
  if (!seq) return;
  if (!s.playing && T() >= seqDuration(seq) - 0.01) s.setPlayhead(0);
  s.set({ playing: !s.playing, rate: 1, source: { ...s.source, playing: false } });
}

export function shuttle(dir: 1 | -1 | 0) {
  const s = st();
  if (dir === 0) return s.set({ playing: false, rate: 1, source: { ...s.source, playing: false } });
  const same = s.playing && Math.sign(s.rate) === dir;
  const rate = same ? Math.min(8, Math.abs(s.rate) * 2) * dir : dir;
  s.set({ playing: true, rate });
}

export function stepFrames(n: number) {
  const s = st();
  if (s.focus === "source" && s.source.mediaId) {
    const m = s.project.media[s.source.mediaId];
    return s.set({ source: { ...s.source, playing: false, t: Math.max(0, Math.min(m.duration, s.source.t + n / (m.fps || 25))) } });
  }
  const seq = S();
  if (!seq) return;
  s.set({ playing: false });
  s.setPlayhead(snapFrame(T() + n / seq.fps, seq.fps));
}

export function goEdit(dir: 1 | -1) {
  const seq = S();
  if (!seq) return;
  const pts = editPoints(seq);
  const t = T();
  st().setPlayhead(dir > 0 ? pts.find((x) => x > t + 1e-4) ?? t : [...pts].reverse().find((x) => x < t - 1e-4) ?? 0);
}

export function goMarker(dir: 1 | -1) {
  const seq = S();
  if (!seq) return;
  const t = T();
  const ms = seq.markers.map((m) => m.t).sort((a, b) => a - b);
  const to = dir > 0 ? ms.find((x) => x > t + 1e-4) : [...ms].reverse().find((x) => x < t - 1e-4);
  if (to !== undefined) st().setPlayhead(to);
}

export function markIn() {
  const s = st();
  if (s.focus === "source" && s.source.mediaId) return s.set({ source: { ...s.source, in: s.source.t } });
  if (S()) s.commitSeq((q) => ({ ...q, inPoint: T(), outPoint: q.outPoint !== null && q.outPoint <= T() ? null : q.outPoint }), "Contrassegna attacco");
}
export function markOut() {
  const s = st();
  if (s.focus === "source" && s.source.mediaId) return s.set({ source: { ...s.source, out: s.source.t } });
  if (S()) s.commitSeq((q) => ({ ...q, outPoint: T(), inPoint: q.inPoint !== null && q.inPoint >= T() ? null : q.inPoint }), "Contrassegna uscita");
}
export function clearInOut() {
  const s = st();
  if (s.focus === "source") return s.set({ source: { ...s.source, in: null, out: null } });
  s.commitSeq((q) => ({ ...q, inPoint: null, outPoint: null }), "Cancella attacco e uscita");
}
export function goToIn() {
  const s = st();
  if (s.focus === "source") return s.set({ source: { ...s.source, t: s.source.in ?? 0 } });
  const q = S();
  if (q?.inPoint !== null && q) s.setPlayhead(q.inPoint!);
}
export function goToOut() {
  const s = st();
  if (s.focus === "source" && s.source.mediaId) return s.set({ source: { ...s.source, t: s.source.out ?? s.project.media[s.source.mediaId].duration } });
  const q = S();
  if (q?.outPoint !== null && q) s.setPlayhead(q.outPoint!);
}
export function markClip() {
  const q = S();
  if (!q) return;
  const tracks = q.tracks.filter((t) => t.target).map((t) => t.id);
  const c = q.clips.find((x) => (tracks.length ? tracks.includes(x.track) : true) && T() >= x.start && T() < clipEnd(x));
  if (c) st().commitSeq((s) => ({ ...s, inPoint: c.start, outPoint: clipEnd(c) }), "Contrassegna clip");
}
export function markSelection() {
  const q = S();
  const sel = q?.clips.filter((c) => st().selection.includes(c.id)) ?? [];
  if (!sel.length) return;
  st().commitSeq((s) => ({ ...s, inPoint: Math.min(...sel.map((c) => c.start)), outPoint: Math.max(...sel.map(clipEnd)) }), "Contrassegna selezione");
}

export function place(mode: "insert" | "overwrite") {
  const s = st();
  const q = needSeq();
  if (!q || !s.source.mediaId) return s.notify("Apri prima una clip nel monitor sorgente");
  const m = s.project.media[s.source.mediaId];
  const a = s.source.in ?? 0;
  const b = s.source.out ?? (isStill(m) ? a + m.duration : m.duration);
  if (b - a < 1 / q.fps) return s.notify("Il punto di uscita deve venire dopo l'attacco");
  const at = q.inPoint ?? T();
  const r = placeMedia(q, m, at, a, b, mode, q.patchV, q.patchA);
  if (!r.ids.length) return s.notify("Nessuna traccia sorgente collegata (attiva V1/A1 a sinistra delle tracce)");
  s.commitSeq(() => r.seq, mode === "insert" ? "Inserisci" : "Sovrascrivi");
  s.set({ selection: [] });
  s.setPlayhead(at + (b - a));
}

export function addEdit(all: boolean) {
  const s = st();
  const q = needSeq();
  if (!q) return;
  const t = T();
  const tracks = all ? q.tracks.map((x) => x.id) : q.tracks.filter((x) => x.target).map((x) => x.id);
  const sel = s.selection.length ? s.selection : null;
  const ids = q.clips.filter((c) => (sel ? sel.includes(c.id) : tracks.includes(c.track)) && t > c.start && t < clipEnd(c)).map((c) => c.id);
  if (!ids.length) return s.notify("Nessuna clip sotto l'indicatore nelle tracce di destinazione");
  s.commitSeq((x) => razor(x, ids, t), all ? "Aggiungi modifica a tutte le tracce" : "Aggiungi modifica");
}

export function addFrameHold() {
  const s = st();
  const q = needSeq();
  if (!q) return;
  const t = T();
  const target = q.clips.find((c) => (s.selection.length ? s.selection.includes(c.id) : true) && isVideoTrack(q, c.track) && t > c.start && t < clipEnd(c));
  if (!target) return s.notify("Metti l'indicatore sopra una clip video (e selezionala)");
  const frame = mediaTime(target, t);
  s.commitSeq((x) => {
    const cut = razor(x, [target.id], t);
    return { ...cut, clips: cut.clips.map((c) => (c.track === target.track && Math.abs(c.start - t) < 1e-6 && c.mediaId === target.mediaId ? { ...c, freeze: frame, name: c.name + " (fermo)" } : c)) };
  }, "Aggiungi fermo immagine");
}

export function deleteSelection(ripple: boolean) {
  const s = st();
  const q = S();
  if (!q) return;
  if (s.selTrans) {
    const { clip, side } = s.selTrans;
    s.commitSeq((x) => ({ ...x, clips: x.clips.map((c) => (c.id === clip ? { ...c, [side === "in" ? "tIn" : "tOut"]: undefined } : c)) }), "Elimina transizione");
    return s.set({ selTrans: null });
  }
  if (s.gap) {
    const next = closeGap(q, s.gap.from, s.gap.to);
    if (!next) return s.notify("Impossibile eliminare con increspatura: in quel tratto altre tracce hanno delle clip");
    s.commitSeq(() => next, "Elimina con increspatura");
    return s.set({ gap: null });
  }
  if (!s.selection.length) return;
  s.commitSeq((x) => deleteClips(x, s.selection, ripple, false), ripple ? "Elimina con increspatura" : "Cancella");
  s.set({ selection: [] });
}

export function copy(cut: boolean) {
  const s = st();
  const q = S();
  if (!q) return;
  const clips = q.clips.filter((c) => s.selection.includes(c.id));
  if (!clips.length) return;
  s.set({ clipboard: clips.map((c) => cloneClip(c, { id: c.id })) });
  if (cut) {
    s.commitSeq((x) => deleteClips(x, s.selection, false, false), "Taglia");
    s.set({ selection: [] });
  }
  s.notify(cut ? `Tagliato: ${clips.length} clip` : `Copiato: ${clips.length} clip`);
}

export function paste(insert: boolean) {
  const s = st();
  const q = needSeq();
  if (!q || !s.clipboard?.length) return;
  const r = pasteClips(q, s.clipboard, T(), insert);
  s.commitSeq(() => r.seq, insert ? "Incolla e inserisci" : "Incolla");
  s.set({ selection: r.ids });
  s.setPlayhead(r.end);
}

export function pasteAttributes(o: { motion: boolean; opacity: boolean; volume: boolean; effects: boolean; speed: boolean }) {
  const s = st();
  const src = s.clipboard?.[0];
  if (!src) return;
  s.commitSeq(
    (q) => ({
      ...q,
      clips: q.clips.map((c) => {
        if (!s.selection.includes(c.id)) return c;
        const v = isVideoTrack(q, c.track);
        const copyFx = cloneClip(src);
        return {
          ...c,
          ...(o.motion && v ? { motion: copyFx.motion } : {}),
          ...(o.opacity && v ? { opacity: copyFx.opacity, blend: src.blend } : {}),
          ...(o.volume && !v ? { volume: copyFx.volume } : {}),
          ...(o.speed ? { speed: src.speed, out: c.in + clipDur(c) * src.speed } : {}),
          ...(o.effects ? { effects: [...c.effects, ...copyFx.effects.filter((e) => !!getEffect(e.defId)?.audio === !v)] } : {}),
        };
      }),
    }),
    "Incolla attributi",
  );
}

export function removeAttributes() {
  const s = st();
  s.commitSeq(
    (q) => ({
      ...q,
      clips: q.clips.map((c) =>
        s.selection.includes(c.id)
          ? { ...c, effects: [], opacity: prop(100), blend: 0, volume: prop(0), motion: { ...newClip(s.project.media[c.mediaId], q, c.track, 0, 0, 1).motion } }
          : c,
      ),
    }),
    "Rimuovi attributi",
  );
}

export function selectAll() {
  const q = S();
  if (q) st().set({ selection: q.clips.map((c) => c.id) });
}

export function toggleEnable() {
  const s = st();
  s.commitSeq((q) => ({ ...q, clips: q.clips.map((c) => (s.selection.includes(c.id) ? { ...c, enabled: !c.enabled } : c)) }), "Abilita");
}

export function linkUnlink() {
  const s = st();
  const q = S();
  if (!q) return;
  const sel = q.clips.filter((c) => s.selection.includes(c.id));
  if (!sel.length) return;
  const allLinked = sel.every((c) => c.linkId && c.linkId === sel[0].linkId);
  const ids = new Set(sel.map((c) => c.id));
  if (allLinked) s.commitSeq((x) => ({ ...x, clips: x.clips.map((c) => (ids.has(c.id) ? { ...c, linkId: undefined } : c)) }), "Scollega");
  else {
    const l = uid("l");
    s.commitSeq((x) => ({ ...x, clips: x.clips.map((c) => (ids.has(c.id) ? { ...c, linkId: l } : c)) }), "Collega");
  }
}

export function nudge(frames: number) {
  const s = st();
  const q = S();
  if (!q || !s.selection.length) return;
  const anchor = q.clips.find((c) => c.id === s.selection[0])!;
  s.commitSeq((x) => moveClips(x, s.selection, frames / x.fps, 0, { anchorVideo: isVideoTrack(x, anchor.track) }), "Sposta");
}

export function moveToTrack(delta: number) {
  const s = st();
  const q = S();
  if (!q || !s.selection.length) return;
  const anchor = q.clips.find((c) => c.id === s.selection[0])!;
  const v = isVideoTrack(q, anchor.track);
  s.commitSeq((x) => moveClips(x, s.selection, 0, v ? delta : -delta, { anchorVideo: v }), "Sposta");
}

export function rippleTrimToPlayhead(which: "prev" | "next") {
  const s = st();
  const q = S();
  if (!q) return;
  const t = T();
  const targets = q.tracks.filter((x) => x.target).map((x) => x.id);
  const c = q.clips.find((x) => targets.includes(x.track) && t > x.start && t < clipEnd(x)) ?? q.clips.find((x) => t > x.start && t < clipEnd(x));
  if (!c) return;
  s.commitSeq((x) => trimEdge(x, s.project, c.id, which === "prev" ? "in" : "out", t, true), "Modifica con increspatura");
  if (which === "prev") s.setPlayhead(c.start);
}

export function liftOrExtract(extract: boolean) {
  const q = S();
  if (!q) return;
  if (q.inPoint === null || q.outPoint === null) return st().notify("Imposta prima attacco (I) e uscita (O) nella sequenza");
  st().commitSeq((x) => liftExtract(x, extract), extract ? "Estrai" : "Solleva");
  if (extract) st().setPlayhead(q.inPoint);
}

export function addMarker() {
  const s = st();
  if (s.focus === "source") return s.notify("Marcatore aggiunto alla clip sorgente");
  s.commitSeq((q) => ({ ...q, markers: [...q.markers, { id: uid("mk"), t: T(), name: "", color: 0, comment: "" }] }), "Aggiungi marcatore");
}
export function clearMarkers() {
  st().commitSeq((q) => ({ ...q, markers: [] }), "Cancella tutti i marcatori");
}

export function applyDefaultTransition(kind: "video" | "audio" | "both") {
  const s = st();
  const q = needSeq();
  if (!q) return;
  const want = (trackId: string) => (kind === "both" ? true : isVideoTrack(q, trackId) === (kind === "video"));
  let next = q;
  let n = 0;
  const sel = q.clips.filter((c) => s.selection.includes(c.id) && want(c.track));
  if (sel.length) {
    for (const c of sel) {
      const def = isVideoTrack(q, c.track) ? DEFAULT_TRANSITION.video : DEFAULT_TRANSITION.audio;
      next = setTransition(next, c.id, "in", def, DEFAULT_TRANSITION.dur);
      next = setTransition(next, c.id, "out", def, DEFAULT_TRANSITION.dur);
      n++;
    }
  } else {
    const t = T();
    for (const tr of q.tracks.filter((x) => x.target && want(x.id))) {
      const onT = q.clips.filter((c) => c.track === tr.id);
      const near = onT.flatMap((c) => [{ c, side: "in" as const, at: c.start }, { c, side: "out" as const, at: clipEnd(c) }]).sort((a, b) => Math.abs(a.at - t) - Math.abs(b.at - t))[0];
      if (!near) continue;
      next = setTransition(next, near.c.id, near.side, tr.kind === "video" ? DEFAULT_TRANSITION.video : DEFAULT_TRANSITION.audio, DEFAULT_TRANSITION.dur);
      n++;
    }
  }
  if (!n) return s.notify("Seleziona una clip o metti l'indicatore vicino a un punto di modifica di una traccia di destinazione");
  s.commitSeq(() => next, "Applica transizione");
}

export function applyTransitionAt(defId: string, clipId: string, side: "in" | "out") {
  const def = getTransition(defId);
  const q = S();
  if (!def || !q) return;
  const c = q.clips.find((x) => x.id === clipId);
  if (!c) return;
  if (!!def.audio === isVideoTrack(q, c.track)) return st().notify(def.audio ? "Le transizioni audio vanno sulle clip audio" : "Le transizioni video vanno sulle clip video");
  st().commitSeq((x) => setTransition(x, clipId, side, defId, DEFAULT_TRANSITION.dur), `Applica ${def.name}`);
}

export function applyEffect(defId: string, ids?: string[]) {
  const s = st();
  const q = needSeq();
  const def = getEffect(defId);
  if (!q || !def) return;
  const target = ids ?? s.selection;
  const ok = q.clips.filter((c) => target.includes(c.id) && isVideoTrack(q, c.track) === !def.audio);
  if (!ok.length) return s.notify(def.audio ? "Seleziona una clip audio" : "Seleziona una clip video");
  const set = new Set(ok.map((c) => c.id));
  s.commitSeq((x) => ({ ...x, clips: x.clips.map((c) => (set.has(c.id) ? { ...c, effects: [...c.effects, newEffect(defId, x.width, x.height)] } : c)) }), `Applica ${def.name}`);
}

export function matchFrame() {
  const s = st();
  const q = S();
  if (!q) return;
  const t = T();
  const order = [...videoTracks(q)].reverse().concat(audioTracks(q));
  for (const tr of order) {
    const c = clipAt(q, tr.id, t);
    if (c && s.project.media[c.mediaId] && !c.graphic) {
      s.set({ source: { mediaId: c.mediaId, t: c.in + (t - c.start) * c.speed, in: c.in, out: c.out, playing: false }, focus: "source" });
      return;
    }
  }
}

export function scaleToFrame(fit: boolean) {
  const s = st();
  s.commitSeq(
    (q) => ({
      ...q,
      clips: q.clips.map((c) => {
        const m = s.project.media[c.mediaId];
        if (!s.selection.includes(c.id) || !m?.width) return c;
        const k = (fit ? Math.min(q.width / m.width, q.height / m.height) : Math.max(q.width / m.width, q.height / m.height)) * 100;
        return { ...c, motion: { ...c.motion, scale: prop(+k.toFixed(1)), scaleW: prop(+k.toFixed(1)) } };
      }),
    }),
    fit ? "Ridimensiona alla dimensione fotogramma" : "Imposta alla dimensione fotogramma",
  );
}

export function zoom(f: number) {
  const s = st();
  const id = s.activeSeq;
  if (!id) return;
  const cur = s.zooms[id] ?? 60;
  s.set({ zooms: { ...s.zooms, [id]: Math.max(2, Math.min(1500, cur * f)) } });
}

export function zoomToFit() {
  const s = st();
  const q = S();
  if (!q) return;
  const w = (document.querySelector("[data-timeline-area]")?.clientWidth ?? 900) - 40;
  s.set({ zooms: { ...s.zooms, [q.id]: Math.max(2, Math.min(1500, w / Math.max(5, seqDuration(q)))) } });
}

export const setTool = (tool: PrTool) => st().set({ tool });

export function addProjectItem(item: Omit<ProjectItem, "id" | "parent" | "label"> & Partial<ProjectItem>, label = "Nuovo elemento") {
  const s = st();
  const it: ProjectItem = { id: uid("it"), parent: s.bin, label: 2, ...item };
  s.commit((p) => ({ ...p, items: [...p.items, it] }), label);
  s.set({ projectSel: [it.id] });
  return it;
}

export function newBin() {
  const it = addProjectItem({ name: "Raccoglitore", type: "bin", label: 7 }, "Nuovo raccoglitore");
  st().set({ dialog: { type: "rename", title: "Nome raccoglitore", value: it.name, onOk: (v) => renameItem(it.id, v) } });
}

export function renameItem(id: string, name: string) {
  const s = st();
  const it = s.project.items.find((x) => x.id === id);
  if (!it || !name.trim()) return;
  s.commit(
    (p) => ({
      ...p,
      items: p.items.map((x) => (x.id === id ? { ...x, name } : x)),
      ...(it.type === "sequence" && it.ref ? { sequences: { ...p.sequences, [it.ref]: { ...p.sequences[it.ref], name } } } : {}),
      ...(it.type === "media" && it.ref ? { media: { ...p.media, [it.ref]: { ...p.media[it.ref], name } } } : {}),
    }),
    "Rinomina",
  );
}

export function createSequence(name: string, width: number, height: number, fps: number) {
  const s = st();
  const q = newSequence(name, width, height, fps);
  s.commit((p) => ({ ...p, sequences: { ...p.sequences, [q.id]: q }, items: [...p.items, { id: uid("it"), name, type: "sequence", parent: s.bin, ref: q.id, label: 0 }] }), "Nuova sequenza");
  s.openSequence(q.id);
  s.setPlayhead(0);
  return q;
}

export function sequenceFromMedia(mediaId: string) {
  const s = st();
  const m = s.project.media[mediaId];
  if (!m) return;
  const q = createSequence(m.name.replace(/\.[^.]+$/, ""), m.width || 1920, m.height || 1080, m.fps || 25);
  const r = placeMedia(q, m, 0, 0, isStill(m) ? 5 : m.duration, "overwrite", q.patchV, q.patchA);
  s.commitSeq(() => r.seq, "Sequenza da clip");
}

const SYNTH: Record<string, { name: string; kind: MediaKind; color?: string }> = {
  black: { name: "Video nero", kind: "black" },
  adjustment: { name: "Livello di regolazione", kind: "adjustment" },
  bars: { name: "Barre e tono HD", kind: "bars" },
  countdown: { name: "Contatore universale", kind: "countdown", color: "#bdbdbd" },
};

export function newSyntheticItem(kind: "black" | "adjustment" | "bars" | "countdown" | "matte", color?: string, name?: string) {
  const s = st();
  const q = S();
  const base = SYNTH[kind] ?? { name: "Mascherino colore", kind: "matte" as MediaKind };
  const m: Media = {
    id: uid("m"),
    name: name ?? base.name,
    kind: base.kind,
    duration: kind === "countdown" ? 11 : 5,
    width: q?.width ?? 1920,
    height: q?.height ?? 1080,
    fps: q?.fps ?? 25,
    hasVideo: true,
    hasAudio: kind === "bars",
    color: color ?? base.color,
    still: kind !== "countdown",
  };
  s.commit((p) => ({ ...p, media: { ...p.media, [m.id]: m } }), "Nuovo elemento");
  addProjectItem({ name: m.name, type: "media", ref: m.id, label: kind === "adjustment" ? 3 : 4 }, base.name);
}

export async function importFiles(files: FileList | File[]) {
  const s = st();
  let n = 0;
  for (const f of Array.from(files)) {
    const m = await importFile(f, uid("f"));
    if (!m) {
      s.notify(`Formato non supportato: ${f.name}`);
      continue;
    }
    st().commit((p) => ({ ...p, media: { ...p.media, [m.id]: m } }), "Importa");
    addProjectItem({ name: m.name, type: "media", ref: m.id, label: m.kind === "audio" ? 5 : m.kind === "image" ? 6 : 2 }, "Importa");
    n++;
  }
  if (n) s.notify(`Importati ${n} file`);
}

export function importSample(m: Media) {
  const s = st();
  if (s.project.items.some((i) => i.ref === m.id)) return s.notify(`${m.name} è già nel progetto`);
  s.commit((p) => ({ ...p, media: { ...p.media, [m.id]: m } }), "Importa");
  addProjectItem({ name: m.name, type: "media", ref: m.id, label: m.kind === "audio" ? 5 : 2 }, "Importa");
}

export function deleteProjectItems(ids: string[]) {
  const s = st();
  const all = new Set<string>();
  const walk = (id: string) => {
    all.add(id);
    s.project.items.filter((i) => i.parent === id).forEach((i) => walk(i.id));
  };
  ids.forEach(walk);
  const items = s.project.items.filter((i) => all.has(i.id));
  const mediaIds = new Set(items.filter((i) => i.type === "media").map((i) => i.ref!));
  const seqIds = new Set(items.filter((i) => i.type === "sequence").map((i) => i.ref!));
  const used = Object.values(s.project.sequences).some((q) => q.clips.some((c) => mediaIds.has(c.mediaId)));
  const run = () => {
    s.commit(
      (p) => ({
        ...p,
        items: p.items.filter((i) => !all.has(i.id)),
        sequences: Object.fromEntries(
          Object.entries(p.sequences)
            .filter(([id]) => !seqIds.has(id))
            .map(([id, q]) => [id, { ...q, clips: q.clips.filter((c) => !mediaIds.has(c.mediaId)) }]),
        ),
      }),
      "Elimina",
    );
    s.set({ openSeqs: s.openSeqs.filter((id) => !seqIds.has(id)), activeSeq: s.activeSeq && seqIds.has(s.activeSeq) ? s.openSeqs.find((id) => !seqIds.has(id)) ?? null : s.activeSeq, projectSel: [] });
  };
  if (used) s.set({ dialog: { type: "confirm", title: "Elimina elementi", text: "Alcuni elementi sono usati in una sequenza. Le loro clip verranno rimosse dalle sequenze. Continuare?", onOk: run } });
  else run();
}

export function moveItems(ids: string[], parent: string | null) {
  const s = st();
  s.commit((p) => ({ ...p, items: p.items.map((i) => (ids.includes(i.id) && i.id !== parent ? { ...i, parent } : i)) }), "Sposta");
}

export function addTracks(nv: number, na: number) {
  st().commitSeq((q) => {
    const vt = videoTracks(q);
    const at = audioTracks(q);
    const v = Array.from({ length: nv }, (_, i) => makeTrack("video", vt.length + i + 1));
    const a = Array.from({ length: na }, (_, i) => makeTrack("audio", at.length + i + 1));
    return { ...q, tracks: [...vt, ...v.map((t) => ({ ...t, target: false })), ...at, ...a.map((t) => ({ ...t, target: false }))] };
  }, "Aggiungi tracce");
}

export function deleteTrack(id: string) {
  const q = S();
  if (!q) return;
  const t = q.tracks.find((x) => x.id === id);
  if (!t) return;
  const same = q.tracks.filter((x) => x.kind === t.kind);
  if (same.length <= 1) return st().notify("Una sequenza deve avere almeno una traccia di questo tipo");
  st().commitSeq((x) => ({ ...x, tracks: x.tracks.filter((k) => k.id !== id), clips: x.clips.filter((c) => c.track !== id), patchV: x.patchV === id ? null : x.patchV, patchA: x.patchA === id ? null : x.patchA }), "Elimina traccia");
}

export function updateTrack(id: string, patch: Partial<Sequence["tracks"][number]>, label: string) {
  st().commitSeq((q) => ({ ...q, tracks: q.tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }), label);
}

export function createGraphic(kind: "text" | "rect" | "ellipse", x: number, y: number) {
  const s = st();
  const q = needSeq();
  if (!q) return;
  const t = T();
  const vts = videoTracks(q);
  const sel = q.clips.find((c) => s.selection.includes(c.id) && c.graphic && t >= c.start && t < clipEnd(c));
  const layer = newGraphicLayer(kind, x, y, q);
  if (sel) {
    s.commitSeq((z) => ({ ...z, clips: z.clips.map((c) => (c.id === sel.id ? { ...c, graphic: [...(c.graphic ?? []), layer] } : c)) }), "Nuovo livello");
    s.set({ editingText: kind === "text" ? layer.id : null });
    return;
  }
  const free = [...vts].reverse().find((tr) => !tr.locked && !q.clips.some((c) => c.track === tr.id && c.start < t + 5 && clipEnd(c) > t));
  let target = free?.id;
  let next = q;
  if (!target || vts.findIndex((v) => v.id === target) < vts.findIndex((v) => q.clips.some((c) => c.track === v.id && c.start <= t && clipEnd(c) > t))) {
    const nt = makeTrack("video", vts.length + 1);
    next = { ...q, tracks: [...vts, { ...nt, target: false }, ...audioTracks(q)] };
    target = nt.id;
  }
  const m: Media = { id: uid("g"), name: kind === "text" ? "Grafica" : "Forma", kind: "graphic", duration: 5, width: q.width, height: q.height, fps: q.fps, hasVideo: true, hasAudio: false, still: true };
  const c: Clip = { ...newClip(m, next, target, t, 0, 5), name: kind === "text" ? layer.text : layer.name, label: 6, graphic: [layer] };
  s.commit((p) => ({ ...p, media: { ...p.media, [m.id]: m }, sequences: { ...p.sequences, [q.id]: { ...next, clips: [...next.clips, c] } } }), "Nuova grafica");
  s.set({ selection: [c.id], editingText: kind === "text" ? layer.id : null, tool: kind === "text" ? "type" : "select" });
}

export function updateGraphicLayer(clipId: string, layerId: string, patch: Record<string, unknown>, key?: string) {
  st().commitSeq(
    (q) => ({
      ...q,
      clips: q.clips.map((c) =>
        c.id === clipId ? { ...c, graphic: c.graphic?.map((g) => (g.id === layerId ? { ...g, ...patch } : g)), name: patch.text !== undefined && c.graphic?.[0]?.id === layerId ? String(patch.text).slice(0, 30) || "Grafica" : c.name } : c,
      ),
    }),
    "Modifica grafica",
    key,
  );
}

export function updateClip(id: string, fn: (c: Clip) => Clip, label: string, key?: string) {
  st().commitSeq((q) => ({ ...q, clips: q.clips.map((c) => (c.id === id ? fn(c) : c)) }), label, key);
}

export { linked, shiftTrack };
