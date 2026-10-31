import { mapKeys, prop, setAt, toggleKeyAt, uid, valueAt, withKind, type KeyKind, type Prop } from "@/lib/studio/anim";
import { getEffect, newEffect } from "@/lib/studio/effects";
import { importFile, type Media } from "@/lib/studio/media";
import {
  cloneLayer,
  compOf,
  getProp,
  layerProps,
  makeLayer,
  mapLayerProps,
  newComp,
  shiftLayer,
  timeOf,
  useAe,
  withProp,
  type AeItem,
  type Comp,
  type Layer,
  type LayerType,
} from "@/lib/studio/ae";

const st = () => useAe.getState();
const C = () => compOf(st());
const T = () => timeOf(st());
const fr = () => 1 / (C()?.fps ?? 30);

export function needComp(): Comp | null {
  const c = C();
  if (!c) st().notify("Apri o crea prima una composizione");
  return c;
}

export function updateLayer(id: string, fn: (l: Layer) => Layer, label: string, key?: string) {
  st().commitComp((c) => ({ ...c, layers: c.layers.map((l) => (l.id === id ? fn(l) : l)) }), label, key);
}

export function setPropValue(layerId: string, path: string, v: number[], key?: string) {
  const c = C();
  if (!c) return;
  updateLayer(layerId, (l) => {
    const p = getProp(l, path);
    return p ? withProp(l, path, setAt(p, v, T(), c.fps)) : l;
  }, "Modifica valore", key);
}

export function addLayer(type: LayerType, extra: Partial<Layer> = {}, media?: Media) {
  const s = st();
  const c = needComp();
  if (!c) return null;
  const l = makeLayer(type, c, extra, media);
  const idx = Math.max(0, c.layers.findIndex((x) => s.selected.includes(x.id)));
  s.commitComp((x) => ({ ...x, layers: [...x.layers.slice(0, idx), l, ...x.layers.slice(idx)] }), "Nuovo livello");
  s.set({ selected: [l.id], selectedKeys: [] });
  return l;
}

export function addMediaLayer(mediaId: string) {
  const s = st();
  const m = s.project.media[mediaId];
  if (!m) return;
  addLayer("footage", { inPoint: T(), startTime: T(), outPoint: Math.min(C()?.duration ?? 10, T() + (m.still ? 999 : m.duration)) }, m);
}

export function addCompLayer(compId: string) {
  const s = st();
  const sub = s.project.comps[compId];
  const c = C();
  if (!sub || !c || sub.id === c.id) return s.notify("Non puoi inserire una composizione dentro sé stessa");
  addLayer("precomp", { source: sub.id, name: sub.name, w: sub.width, h: sub.height, transform: makeLayer("precomp", c).transform, outPoint: Math.min(c.duration, sub.duration) });
  updateLayer(st().selected[0], (l) => ({ ...l, transform: { ...l.transform, anchor: prop(sub.width / 2, sub.height / 2) } }), "Nuovo livello");
}

export function duplicate() {
  const s = st();
  const c = C();
  if (!c) return;
  const sel = c.layers.filter((l) => s.selected.includes(l.id));
  if (!sel.length) return;
  const copies = new Map(sel.map((l) => [l.id, cloneLayer(l, { name: l.name + " 2" })]));
  s.commitComp((x) => ({ ...x, layers: x.layers.flatMap((l) => (copies.has(l.id) ? [copies.get(l.id)!, l] : [l])) }), "Duplica livello");
  s.set({ selected: [...copies.values()].map((l) => l.id) });
}

export function splitLayer() {
  const s = st();
  const c = C();
  if (!c) return;
  const t = T();
  const sel = c.layers.filter((l) => s.selected.includes(l.id) && t > l.inPoint && t < l.outPoint);
  if (!sel.length) return s.notify("Seleziona un livello e porta l'indicatore all'interno della sua durata");
  const added: string[] = [];
  s.commitComp(
    (x) => ({
      ...x,
      layers: x.layers.flatMap((l) => {
        if (!sel.some((y) => y.id === l.id)) return [l];
        const b = cloneLayer(l, { inPoint: t });
        added.push(b.id);
        return [b, { ...l, outPoint: t }];
      }),
    }),
    "Dividi livello",
  );
  s.set({ selected: added });
}

export function deleteSelected() {
  const s = st();
  const c = C();
  if (!c) return;
  if (s.selectedKeys.length) {
    const ids = new Set(s.selectedKeys);
    s.commitComp((x) => ({ ...x, layers: x.layers.map((l) => mapLayerProps(l, (p) => mapKeys(p, (k) => (ids.has(k.id) ? null : k)))) }), "Elimina fotogrammi chiave");
    return s.set({ selectedKeys: [] });
  }
  if (s.selectedProps.length && s.selectedProps.some((p) => p.split("|")[1].startsWith("e."))) {
  }
  if (!s.selected.length) return;
  s.commitComp((x) => ({ ...x, layers: x.layers.filter((l) => !s.selected.includes(l.id)).map((l) => (l.parent && s.selected.includes(l.parent) ? { ...l, parent: null } : l)) }), "Elimina livello");
  s.set({ selected: [] });
}

export function copy(cut: boolean) {
  const s = st();
  const c = C();
  if (!c) return;
  if (s.selectedKeys.length) {
    const ids = new Set(s.selectedKeys);
    const groups: { path: string; keys: { t: number; v: number[] }[] }[] = [];
    for (const l of c.layers)
      for (const { path, prop: p } of layerProps(l)) {
        const ks = p.keys?.filter((k) => ids.has(k.id));
        if (ks?.length) groups.push({ path, keys: ks.map((k) => ({ t: k.t, v: [...k.v] })) });
      }
    s.set({ clipboard: { keys: groups } });
    return s.notify(`Copiati ${s.selectedKeys.length} fotogrammi chiave`);
  }
  const layers = c.layers.filter((l) => s.selected.includes(l.id));
  if (!layers.length) return;
  s.set({ clipboard: { layers: layers.map((l) => cloneLayer(l, { id: l.id })) } });
  if (cut) deleteSelected();
  s.notify(cut ? `Tagliati ${layers.length} livelli` : `Copiati ${layers.length} livelli`);
}

export function paste() {
  const s = st();
  const c = needComp();
  if (!c || !s.clipboard) return;
  if (s.clipboard.keys) {
    const target = c.layers.filter((l) => s.selected.includes(l.id));
    if (!target.length) return s.notify("Seleziona il livello su cui incollare i fotogrammi chiave");
    const t0 = Math.min(...s.clipboard.keys.flatMap((g) => g.keys.map((k) => k.t)));
    s.commitComp(
      (x) => ({
        ...x,
        layers: x.layers.map((l) => {
          if (!target.some((y) => y.id === l.id)) return l;
          let out = l;
          for (const g of s.clipboard!.keys!) {
            let p = getProp(out, g.path);
            if (!p) continue;
            if (!p.keys) p = { ...p, keys: [] };
            for (const k of g.keys) p = setAt(p, k.v, T() + k.t - t0, x.fps);
            out = withProp(out, g.path, p);
          }
          return out;
        }),
      }),
      "Incolla fotogrammi chiave",
    );
    return;
  }
  const layers = s.clipboard.layers ?? [];
  const copies = layers.map((l) => cloneLayer(l));
  const idx = Math.max(0, c.layers.findIndex((x) => s.selected.includes(x.id)));
  s.commitComp((x) => ({ ...x, layers: [...x.layers.slice(0, idx), ...copies, ...x.layers.slice(idx)] }), "Incolla livelli");
  s.set({ selected: copies.map((l) => l.id) });
}

export function selectAll() {
  const c = C();
  if (c) st().set({ selected: c.layers.map((l) => l.id) });
}

export function setInterp(kind: KeyKind) {
  const s = st();
  if (!s.selectedKeys.length) return s.notify("Seleziona prima uno o più fotogrammi chiave");
  const ids = new Set(s.selectedKeys);
  s.commitComp((x) => ({ ...x, layers: x.layers.map((l) => mapLayerProps(l, (p) => mapKeys(p, (k) => (ids.has(k.id) ? withKind(k, kind) : k)))) }), kind === "ease" ? "Easy Ease" : kind === "easeIn" ? "Easy Ease in entrata" : kind === "easeOut" ? "Easy Ease in uscita" : kind === "hold" ? "Interpolazione tenuta" : "Interpolazione lineare");
}

export function keyProp(path: string) {
  const s = st();
  const c = C();
  if (!c) return;
  s.commitComp(
    (x) => ({
      ...x,
      layers: x.layers.map((l) => {
        if (!s.selected.includes(l.id)) return l;
        const p = getProp(l, path);
        if (!p) return l;
        const v = valueAt(p, T());
        return withProp(l, path, setAt(p.keys ? p : { ...p, keys: [] }, v, T(), x.fps));
      }),
    }),
    "Aggiungi fotogramma chiave",
  );
  reveal([path], true);
}

export function reveal(paths: string[] | "animated" | "effects" | "masks" | "audio", add: boolean) {
  const s = st();
  const c = C();
  if (!c) return;
  const targets = s.selected.length ? c.layers.filter((l) => s.selected.includes(l.id)) : c.layers;
  const open = { ...s.open };
  let same = true;
  for (const l of targets) {
    const want =
      paths === "animated"
        ? layerProps(l)
            .filter((p) => p.prop.keys || p.prop.expr)
            .map((p) => p.path)
        : paths === "effects"
          ? l.effects.length
            ? ["effects"]
            : []
          : paths === "masks"
            ? l.masks.length
              ? ["masks"]
              : []
            : paths === "audio"
              ? l.audio
                ? ["a.level"]
                : []
              : paths;
    const cur = open[l.id];
    const prev = cur === "all" || !cur ? [] : cur;
    const next = add ? [...new Set([...prev, ...want])] : want;
    if (JSON.stringify(cur) !== JSON.stringify(next)) same = false;
    if (next.length) open[l.id] = next;
    else delete open[l.id];
  }
  if (same && !add) for (const l of targets) delete open[l.id];
  s.set({ open });
}

export function moveLayerOrder(dir: "up" | "down" | "top" | "bottom") {
  const s = st();
  const c = C();
  if (!c || !s.selected.length) return;
  s.commitComp((x) => {
    const sel = x.layers.filter((l) => s.selected.includes(l.id));
    const rest = x.layers.filter((l) => !s.selected.includes(l.id));
    if (dir === "top") return { ...x, layers: [...sel, ...rest] };
    if (dir === "bottom") return { ...x, layers: [...rest, ...sel] };
    const arr = [...x.layers];
    const idxs = arr.map((l, i) => (s.selected.includes(l.id) ? i : -1)).filter((i) => i >= 0);
    const ordered = dir === "up" ? idxs : [...idxs].reverse();
    for (const i of ordered) {
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length || s.selected.includes(arr[j].id)) continue;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return { ...x, layers: arr };
  }, "Disponi livelli");
}

export function trimTo(which: "in" | "out") {
  const s = st();
  const t = T();
  s.commitComp((x) => ({ ...x, layers: x.layers.map((l) => (s.selected.includes(l.id) ? (which === "in" ? { ...l, inPoint: Math.min(t, l.outPoint - fr()) } : { ...l, outPoint: Math.max(t + fr(), l.inPoint + fr()) }) : l)) }), "Rifila livello");
}

export function moveTo(which: "in" | "out") {
  const s = st();
  const t = T();
  s.commitComp((x) => ({ ...x, layers: x.layers.map((l) => (s.selected.includes(l.id) ? shiftLayer(l, which === "in" ? t - l.inPoint : t + fr() - l.outPoint) : l)) }), "Sposta livello");
}

export function goKey(dir: 1 | -1) {
  const s = st();
  const c = C();
  if (!c) return;
  const layers = s.selected.length ? c.layers.filter((l) => s.selected.includes(l.id)) : c.layers;
  const times = [...new Set(layers.flatMap((l) => [l.inPoint, l.outPoint, ...layerProps(l).flatMap((p) => p.prop.keys?.map((k) => k.t) ?? [])]))].sort((a, b) => a - b);
  const t = T();
  const to = dir > 0 ? times.find((x) => x > t + 1e-4) : [...times].reverse().find((x) => x < t - 1e-4);
  if (to !== undefined) s.setTime(to);
}

export function applyEffect(defId: string, ids?: string[]) {
  const s = st();
  const c = needComp();
  const def = getEffect(defId);
  if (!c || !def) return;
  const target = ids ?? s.selected;
  if (!target.length) return s.notify("Seleziona un livello");
  s.commitComp((x) => ({ ...x, layers: x.layers.map((l) => (target.includes(l.id) ? { ...l, effects: [...l.effects, newEffect(defId, l.w || x.width, l.h || x.height)] } : l)) }), `Applica ${def.name}`);
  s.set({ open: { ...s.open, ...Object.fromEntries(target.map((id) => [id, ["effects"]])) } });
}

export function centerAnchor() {
  const s = st();
  s.commitComp(
    (x) => ({
      ...x,
      layers: x.layers.map((l) => {
        if (!s.selected.includes(l.id)) return l;
        const a = l.type === "text" || l.type === "shape" ? [0, 0] : [l.w / 2, l.h / 2];
        const old = valueAt(l.transform.anchor, T());
        const pos = valueAt(l.transform.position, T());
        return { ...l, transform: { ...l.transform, anchor: prop(...a), position: setAt(l.transform.position, [pos[0] + a[0] - old[0], pos[1] + a[1] - old[1], ...pos.slice(2)], T(), x.fps) } };
      }),
    }),
    "Centra punto di ancoraggio",
  );
}

export function centerLayer() {
  const s = st();
  s.commitComp((x) => ({ ...x, layers: x.layers.map((l) => (s.selected.includes(l.id) ? { ...l, transform: { ...l.transform, position: setAt(l.transform.position, [x.width / 2, x.height / 2], T(), x.fps) } } : l)) }), "Centra livello");
}

export function fitToComp(mode: "fit" | "width" | "height") {
  const s = st();
  s.commitComp(
    (x) => ({
      ...x,
      layers: x.layers.map((l) => {
        if (!s.selected.includes(l.id) || !l.w) return l;
        const sx = (x.width / l.w) * 100;
        const sy = (x.height / l.h) * 100;
        const sc = mode === "fit" ? [sx, sy] : mode === "width" ? [sx, sx] : [sy, sy];
        return { ...l, transform: { ...l.transform, scale: prop(...sc), position: prop(x.width / 2, x.height / 2), anchor: prop(l.w / 2, l.h / 2) } };
      }),
    }),
    "Adatta alla composizione",
  );
}

export function reverseLayer() {
  const s = st();
  s.commitComp((x) => ({ ...x, layers: x.layers.map((l) => (s.selected.includes(l.id) ? { ...l, reversed: !l.reversed } : l)) }), "Inverti tempo livello");
}

export function toggle3D(id?: string) {
  const s = st();
  const ids = id ? [id] : s.selected;
  s.commitComp(
    (x) => ({
      ...x,
      layers: x.layers.map((l) => {
        if (!ids.includes(l.id)) return l;
        const on = !l.threeD;
        const fix = (p: Prop, n: number) => ({ ...p, value: on ? [...p.value.slice(0, 2), ...(n === 3 ? [0] : [])] : p.value.slice(0, 2), keys: p.keys?.map((k) => ({ ...k, v: on ? [...k.v.slice(0, 2), 0] : k.v.slice(0, 2) })) ?? null });
        return { ...l, threeD: on, transform: { ...l.transform, position: fix(l.transform.position, 3), anchor: fix(l.transform.anchor, 3) } };
      }),
    }),
    "Livello 3D",
  );
}

export function toggleStopwatchAlt(layerId: string, path: string) {
  const s = st();
  const key = `${layerId}|${path}`;
  const l = C()?.layers.find((x) => x.id === layerId);
  const p = l ? getProp(l, path) : undefined;
  if (!l || !p) return;
  if (p.expr !== undefined) {
    updateLayer(layerId, (x) => withProp(x, path, { ...p, expr: undefined }), "Rimuovi espressione");
    s.set({ exprOpen: s.exprOpen.filter((k) => k !== key) });
  } else {
    const def = path === "t.position" ? "wiggle(2, 50)" : path === "t.rotation" ? "time * 90" : path === "t.scale" ? "value" : "value";
    updateLayer(layerId, (x) => withProp(x, path, { ...p, expr: def }), "Aggiungi espressione");
    s.set({ exprOpen: [...s.exprOpen, key] });
  }
}

export function toggleKey(layerId: string, path: string) {
  const c = C();
  if (!c) return;
  updateLayer(layerId, (l) => {
    const p = getProp(l, path);
    return p ? withProp(l, path, toggleKeyAt(p, T(), c.fps)) : l;
  }, "Fotogramma chiave");
}

export function createComp(name: string, width: number, height: number, fps: number, duration: number, bg: string) {
  const s = st();
  const c = newComp(name, width, height, fps, duration, bg);
  s.commit((p) => ({ ...p, comps: { ...p.comps, [c.id]: c }, items: [...p.items, { id: uid("it"), name, type: "comp", parent: s.folder, ref: c.id, label: 15 }] }), "Nuova composizione");
  s.openComp(c.id);
  return c;
}

export function compFromFootage(mediaId: string) {
  const s = st();
  const m = s.project.media[mediaId];
  if (!m) return;
  createComp(m.name.replace(/\.[^.]+$/, ""), m.width || 1920, m.height || 1080, m.fps || 30, m.still ? 10 : Math.max(1, m.duration), "#000000");
  addMediaLayer(mediaId);
}

export function newFolder() {
  const s = st();
  const it: AeItem = { id: uid("fold"), name: "Cartella senza titolo", type: "folder", parent: s.folder, label: 2 };
  s.commit((p) => ({ ...p, items: [...p.items, it] }), "Nuova cartella");
  s.set({ projectSel: [it.id], dialog: { type: "rename", title: "Nome cartella", value: it.name, onOk: (v) => renameItem(it.id, v) } });
}

export function renameItem(id: string, name: string) {
  const s = st();
  const it = s.project.items.find((i) => i.id === id);
  if (!it || !name.trim()) return;
  s.commit((p) => ({ ...p, items: p.items.map((i) => (i.id === id ? { ...i, name } : i)), ...(it.type === "comp" && it.ref ? { comps: { ...p.comps, [it.ref]: { ...p.comps[it.ref], name } } } : {}) }), "Rinomina");
}

export function deleteItems(ids: string[]) {
  const s = st();
  const all = new Set<string>();
  const walk = (id: string) => {
    all.add(id);
    s.project.items.filter((i) => i.parent === id).forEach((i) => walk(i.id));
  };
  ids.forEach(walk);
  const items = s.project.items.filter((i) => all.has(i.id));
  const refs = new Set(items.map((i) => i.ref).filter(Boolean) as string[]);
  s.commit(
    (p) => ({
      ...p,
      items: p.items.filter((i) => !all.has(i.id)),
      comps: Object.fromEntries(
        Object.entries(p.comps)
          .filter(([id]) => !refs.has(id))
          .map(([id, c]) => [id, { ...c, layers: c.layers.filter((l) => !l.source || !refs.has(l.source)) }]),
      ),
    }),
    "Elimina",
  );
  s.set({ projectSel: [], openComps: s.openComps.filter((id) => !refs.has(id)), activeComp: s.activeComp && refs.has(s.activeComp) ? s.openComps.find((id) => !refs.has(id)) ?? null : s.activeComp });
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
    st().commit((p) => ({ ...p, media: { ...p.media, [m.id]: m }, items: [...p.items, { id: uid("it"), name: m.name, type: "footage", parent: st().folder, ref: m.id, label: m.kind === "audio" ? 7 : 3 }] }), "Importa");
    n++;
  }
  if (n) s.notify(`Importati ${n} file`);
}

export function importSample(m: Media) {
  const s = st();
  if (s.project.items.some((i) => i.ref === m.id)) return s.notify(`${m.name} è già nel progetto`);
  s.commit((p) => ({ ...p, media: { ...p.media, [m.id]: m }, items: [...p.items, { id: uid("it"), name: m.name, type: "footage", parent: s.folder, ref: m.id, label: 3 }] }), "Importa");
}

export function precompose(name: string) {
  const s = st();
  const c = C();
  if (!c) return;
  const sel = c.layers.filter((l) => s.selected.includes(l.id));
  if (!sel.length) return;
  const sub = { ...newComp(name, c.width, c.height, c.fps, c.duration, c.bg), layers: sel.map((l) => ({ ...l, parent: l.parent && s.selected.includes(l.parent) ? l.parent : null })) };
  const layer = makeLayer("precomp", c, { source: sub.id, name, w: c.width, h: c.height });
  const firstIdx = c.layers.findIndex((l) => s.selected.includes(l.id));
  s.commit(
    (p) => ({
      ...p,
      comps: { ...p.comps, [sub.id]: sub, [c.id]: { ...c, layers: [...c.layers.slice(0, firstIdx).filter((l) => !s.selected.includes(l.id)), layer, ...c.layers.slice(firstIdx).filter((l) => !s.selected.includes(l.id))] } },
      items: [...p.items, { id: uid("it"), name, type: "comp", parent: s.folder, ref: sub.id, label: 15 }],
    }),
    "Pre-componi",
  );
  s.set({ selected: [layer.id] });
}

export const parentTo = (layerId: string, parent: string | null) => updateLayer(layerId, (l) => ({ ...l, parent }), "Principale");
