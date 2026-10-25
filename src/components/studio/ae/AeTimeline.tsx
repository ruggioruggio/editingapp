"use client";

import { useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronRight, Eye, EyeOff, Lock, LockOpen, Volume2, Type, Square, Film, Layers, CircleDot, Search, Box, LineChart } from "lucide-react";
import { keyKind, mapKeys, setAt, toggleStopwatch, valueAt, withKind, type Key, type Prop } from "@/lib/studio/anim";
import { BLEND_MODES, getEffect, hexToRgb, rgbToHex } from "@/lib/studio/effects";
import { AE_LABELS, compOf, getProp, layerProps, shiftLayer, timeOf, useAe, withProp, type Comp, type Layer, type Mask } from "@/lib/studio/ae";
import type { MenuItemLike } from "@/lib/studio/premiere";
import { Scrub } from "../chrome";
import { KeyGlyph } from "../premiere/Inspectors";
import * as A from "./actions";

const LEFT = 560;
const ROW = 22;

export const aeTime = (t: number, fps: number) => {
  const r = Math.round(fps);
  const f = Math.round(t * r);
  const s = Math.floor(f / r);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${Math.floor(s / 3600)}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f % r)}`;
};

type Row =
  | { kind: "layer"; l: Layer; i: number }
  | { kind: "group"; l: Layer; id: string; name: string; depth: number; extra?: ReactNode; onReset?: () => void }
  | { kind: "prop"; l: Layer; path: string; name: string; depth: number; dims: number; unit?: { step?: number; decimals?: number; suffix?: string; min?: number; max?: number }; input?: ReactNode }
  | { kind: "expr"; l: Layer; path: string };

const STOP = (on: boolean, expr?: boolean) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={expr ? "#e8d43a" : on ? "#3d9cf0" : "#9a9a9a"} strokeWidth="1.2">
    <circle cx="7" cy="8" r="5" />
    <path d="M7 8V5M5.5 1.5h3M7 1.5V3" />
    {on && <circle cx="7" cy="8" r="2" fill="#3d9cf0" />}
  </svg>
);

function maskModeLabel(m: Mask["mode"]) {
  return { add: "Aggiungi", subtract: "Sottrai", intersect: "Interseca", none: "Nessuna" }[m];
}

export function AeTimeline() {
  const st = useAe();
  const comp = compOf(st);
  if (!comp) return <div className="grid h-full place-items-center text-[12px] text-[#8a8a8a]">Nessuna composizione aperta. Fai doppio clic su una composizione nel pannello Progetto.</div>;
  return <TimelineBody comp={comp} />;
}

function TimelineBody({ comp }: { comp: Comp }) {
  const st = useAe();
  const t = timeOf(st);
  const pps = st.zooms[comp.id] ?? 220;
  const scroller = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [rename, setRename] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [box, setBox] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const fps = comp.fps;
  const width = comp.duration * pps;
  const sel = st.selected;

  const xToTime = (clientX: number) => {
    const el = scroller.current!;
    return Math.max(0, Math.min(comp.duration, (clientX - el.getBoundingClientRect().left - LEFT + el.scrollLeft) / pps));
  };
  const toFrame = (x: number) => Math.round(x * fps) / fps;

  const drag = (e: React.PointerEvent, onMove: (ev: PointerEvent, dx: number, dy: number) => void, onUp?: (moved: boolean) => void) => {
    const el = e.currentTarget as HTMLElement;
    try { el.setPointerCapture(e.pointerId); } catch {}
    const x0 = e.clientX;
    const y0 = e.clientY;
    let moved = false;
    const move = (ev: PointerEvent) => {
      if (!moved && Math.abs(ev.clientX - x0) < 3 && Math.abs(ev.clientY - y0) < 3) return;
      moved = true;
      onMove(ev, ev.clientX - x0, ev.clientY - y0);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      onUp?.(moved);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  // ---- righe -------------------------------------------------------------------------
  const rows: Row[] = [];
  const isOpen = (l: Layer, key: string) => {
    const o = st.open[l.id];
    if (!o) return false;
    if (o === "all") return true;
    return o.some((p) => p === key || p.startsWith(key));
  };
  comp.layers.forEach((l, i) => {
    if (st.hideShy && l.shy) return;
    if (q && !l.name.toLowerCase().includes(q.toLowerCase())) return;
    rows.push({ kind: "layer", l, i });
    const o = st.open[l.id];
    if (!o) return;
    const all = o === "all";
    const g = (id: string) => !collapsed.has(l.id + id);
    const pushProp = (path: string, name: string, depth: number, dims: number, unit?: Row extends never ? never : { step?: number; decimals?: number; suffix?: string; min?: number; max?: number }, input?: ReactNode) => {
      if (!all && !(o as string[]).some((p) => p === path || p === "effects" || p === "masks" || path.startsWith(p + "."))) return;
      rows.push({ kind: "prop", l, path, name, depth, dims, unit, input });
      if (getProp(l, path)?.expr !== undefined) rows.push({ kind: "expr", l, path });
    };
    if (l.type === "text" && all) {
      rows.push({ kind: "group", l, id: "text", name: "Testo", depth: 1 });
      if (g("text")) rows.push({ kind: "prop", l, path: "text.source", name: "Testo sorgente", depth: 2, dims: 0, input: <span className="truncate text-[#d0d0d0]">{l.text}</span> });
    }
    if (l.shape && (all || (o as string[]).some((p) => p.startsWith("s.")))) {
      rows.push({ kind: "group", l, id: "shape", name: "Contenuto", depth: 1 });
      if (g("shape")) {
        rows.push({ kind: "group", l, id: "shape1", name: { rect: "Rettangolo 1", ellipse: "Ellisse 1", star: "Stella 1", polygon: "Poligono 1" }[l.shape.kind], depth: 2 });
        if (g("shape1")) {
          pushProp("s.size", "Dimensione", 3, 2);
          if (l.shape.kind === "rect") pushProp("s.roundness", "Arrotondamento", 3, 1);
          rows.push({
            kind: "prop",
            l,
            path: "s.fill",
            name: "Riempimento",
            depth: 3,
            dims: 0,
            input: (
              <span className="flex items-center gap-2">
                <input type="checkbox" checked={l.shape.fillOn} onChange={(e) => A.updateLayer(l.id, (x) => ({ ...x, shape: { ...x.shape!, fillOn: e.target.checked } }), "Riempimento")} className="h-3 w-3 accent-[#2680eb]" />
                <input type="color" value={l.shape.fill} onChange={(e) => A.updateLayer(l.id, (x) => ({ ...x, shape: { ...x.shape!, fill: e.target.value } }), "Colore", "fill" + l.id)} className="h-3.5 w-7 cursor-pointer border border-[#4a4a4a] bg-transparent p-0" />
              </span>
            ),
          });
          rows.push({
            kind: "prop",
            l,
            path: "s.stroke",
            name: "Traccia",
            depth: 3,
            dims: 0,
            input: (
              <span className="flex items-center gap-2">
                <input type="checkbox" checked={l.shape.strokeOn} onChange={(e) => A.updateLayer(l.id, (x) => ({ ...x, shape: { ...x.shape!, strokeOn: e.target.checked } }), "Traccia")} className="h-3 w-3 accent-[#2680eb]" />
                <input type="color" value={l.shape.stroke} onChange={(e) => A.updateLayer(l.id, (x) => ({ ...x, shape: { ...x.shape!, stroke: e.target.value } }), "Colore traccia", "str" + l.id)} className="h-3.5 w-7 cursor-pointer border border-[#4a4a4a] bg-transparent p-0" />
              </span>
            ),
          });
          pushProp("s.strokeWidth", "Larghezza traccia", 3, 1, { min: 0, max: 500 });
        }
      }
    }
    if (l.masks.length && (all || (o as string[]).some((p) => p === "masks" || p.startsWith("m.")))) {
      rows.push({ kind: "group", l, id: "masks", name: "Maschere", depth: 1 });
      if (g("masks"))
        l.masks.forEach((m, mi) => {
          rows.push({
            kind: "group",
            l,
            id: "mask" + mi,
            name: m.name,
            depth: 2,
            extra: (
              <span className="flex items-center gap-2">
                <select
                  value={m.mode}
                  onChange={(e) => A.updateLayer(l.id, (x) => ({ ...x, masks: x.masks.map((k, j) => (j === mi ? { ...k, mode: e.target.value as Mask["mode"] } : k)) }), "Modalità maschera")}
                  className="h-4 rounded-sm border border-[#3e3e3e] bg-[#151515] px-1 text-[11px] text-[#d0d0d0] outline-none"
                >
                  {(["add", "subtract", "intersect", "none"] as const).map((x) => (
                    <option key={x} value={x}>
                      {maskModeLabel(x)}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-[11px] text-[#bdbdbd]">
                  <input type="checkbox" checked={m.inverted} onChange={(e) => A.updateLayer(l.id, (x) => ({ ...x, masks: x.masks.map((k, j) => (j === mi ? { ...k, inverted: e.target.checked } : k)) }), "Inverti maschera")} className="h-3 w-3 accent-[#2680eb]" />
                  Invertita
                </label>
              </span>
            ),
          });
          if (g("mask" + mi)) {
            pushProp(`m.${mi}.feather`, "Sfumatura maschera", 3, 1, { min: 0, max: 1000, suffix: " pixel" });
            pushProp(`m.${mi}.opacity`, "Opacità maschera", 3, 1, { min: 0, max: 100, suffix: "%" });
            pushProp(`m.${mi}.expansion`, "Espansione maschera", 3, 1, { suffix: " pixel" });
          }
        });
    }
    if (l.effects.length && (all || (o as string[]).some((p) => p === "effects" || p.startsWith("e.")))) {
      rows.push({ kind: "group", l, id: "effects", name: "Effetti", depth: 1 });
      if (g("effects"))
        l.effects.forEach((fx, ei) => {
          const def = getEffect(fx.defId);
          rows.push({
            kind: "group",
            l,
            id: "fx" + fx.id,
            name: def?.name ?? fx.defId,
            depth: 2,
            onReset: () => A.updateLayer(l.id, (x) => ({ ...x, effects: x.effects.map((e) => (e.id === fx.id ? { ...e, params: Object.fromEntries(def!.params.map((p) => [p.id, { value: typeof p.default === "function" ? p.default(x.w, x.h) : p.default, keys: null }])) } : e)) }), "Ripristina effetto"),
            extra: (
              <button type="button" onClick={() => A.updateLayer(l.id, (x) => ({ ...x, effects: x.effects.map((e) => (e.id === fx.id ? { ...e, enabled: !e.enabled } : e)) }), "Attiva/disattiva effetto")} className={clsx("text-[11px] font-bold italic", fx.enabled ? "text-[#d0d0d0]" : "text-[#5a5a5a] line-through")}>
                fx
              </button>
            ),
          });
          if (g("fx" + fx.id))
            def?.params.forEach((pd) => {
              const path = `e.${ei}.${pd.id}`;
              const p = fx.params[pd.id];
              const v = valueAt(p, t);
              let input: ReactNode;
              if (pd.type === "color") input = <input type="color" value={rgbToHex(v)} onChange={(e) => A.setPropValue(l.id, path, hexToRgb(e.target.value), path + l.id)} className="h-3.5 w-7 cursor-pointer border border-[#4a4a4a] bg-transparent p-0" />;
              if (pd.type === "checkbox") input = <input type="checkbox" checked={!!v[0]} onChange={(e) => A.setPropValue(l.id, path, [e.target.checked ? 1 : 0])} className="h-3 w-3 accent-[#2680eb]" />;
              if (pd.type === "select")
                input = (
                  <select value={v[0]} onChange={(e) => A.setPropValue(l.id, path, [Number(e.target.value)])} className="h-4 rounded-sm border border-[#3e3e3e] bg-[#151515] px-1 text-[11px] text-[#d0d0d0] outline-none">
                    {pd.options!.map((o2, k) => (
                      <option key={o2} value={k}>
                        {o2}
                      </option>
                    ))}
                  </select>
                );
              if (all || (o as string[]).some((x) => x === "effects" || x === path)) {
                rows.push({ kind: "prop", l, path, name: pd.name, depth: 3, dims: pd.type === "point" ? 2 : input ? 0 : 1, unit: { step: pd.step, min: pd.min, max: pd.max, suffix: pd.suffix ?? (pd.type === "angle" ? "°" : ""), decimals: (pd.step ?? 1) < 1 ? 2 : 1 }, input });
                if (p.expr !== undefined) rows.push({ kind: "expr", l, path });
              }
            });
        });
    }
    const tPaths = ["t.anchor", "t.position", "t.scale", ...(l.threeD ? ["t.rotX", "t.rotY"] : []), "t.rotation", "t.opacity"];
    if (all || (o as string[]).some((p) => p.startsWith("t."))) {
      if (all) rows.push({ kind: "group", l, id: "transform", name: "Trasforma", depth: 1, onReset: () => A.updateLayer(l.id, (x) => ({ ...x, transform: { ...x.transform, scale: { value: [100, 100], keys: null }, rotation: { value: [0], keys: null }, opacity: { value: [100], keys: null }, position: { value: [comp.width / 2, comp.height / 2, ...(x.threeD ? [0] : [])], keys: null } } }), "Ripristina trasformazione") });
      if (!all || g("transform"))
        for (const path of tPaths) {
          const name = { "t.anchor": "Punto di ancoraggio", "t.position": "Posizione", "t.scale": "Scala", "t.rotX": "Rotazione X", "t.rotY": "Rotazione Y", "t.rotation": l.threeD ? "Rotazione Z" : "Rotazione", "t.opacity": "Opacità" }[path]!;
          const unit = path === "t.scale" ? { suffix: "%", step: 0.5 } : path === "t.opacity" ? { suffix: "%", min: 0, max: 100 } : path.startsWith("t.rot") ? { suffix: "°" } : undefined;
          pushProp(path, name, all ? 2 : 1, path === "t.position" || path === "t.anchor" ? (l.threeD ? 3 : 2) : path === "t.scale" ? 2 : 1, unit);
        }
    }
    if (l.audio && (all || (o as string[]).includes("a.level"))) {
      if (all) rows.push({ kind: "group", l, id: "audio", name: "Audio", depth: 1 });
      pushProp("a.level", "Livelli audio", all ? 2 : 1, 1, { suffix: " dB", min: -60, max: 12, step: 0.1 });
    }
  });

  const keyMenu = (e: React.MouseEvent, l: Layer, path: string, k: Key) => {
    e.preventDefault();
    e.stopPropagation();
    const ids = st.selectedKeys.includes(k.id) ? st.selectedKeys : [k.id];
    st.set({ selectedKeys: ids });
    st.set({
      menu: {
        x: e.clientX,
        y: e.clientY,
        items: [
          { label: "Interpolazione fotogramma chiave…", sub: [
            { label: "Lineare", checked: keyKind(k) === "linear", action: () => A.setInterp("linear") },
            { label: "Bézier", checked: keyKind(k) === "ease", action: () => A.setInterp("ease") },
            { label: "Tenuta", checked: keyKind(k) === "hold", action: () => A.setInterp("hold") },
          ] },
          { label: "Assistente fotogrammi chiave", sub: [
            { label: "Easy Ease", keys: "F9", action: () => A.setInterp("ease") },
            { label: "Easy Ease in entrata", keys: "Maiusc+F9", action: () => A.setInterp("easeIn") },
            { label: "Easy Ease in uscita", keys: "Ctrl+Maiusc+F9", action: () => A.setInterp("easeOut") },
          ] },
          "-",
          { label: "Copia", keys: "Ctrl+C", action: () => A.copy(false) },
          { label: "Cancella", keys: "Canc", action: A.deleteSelected },
        ] as MenuItemLike[],
      },
    });
    void l;
    void path;
  };

  const layerMenu = (e: React.MouseEvent, l: Layer) => {
    e.preventDefault();
    if (!sel.includes(l.id)) st.set({ selected: [l.id] });
    st.set({
      menu: {
        x: e.clientX,
        y: e.clientY,
        items: [
          { label: "Rinomina", keys: "Invio", action: () => setRename(l.id) },
          "-",
          { label: "Livello 3D", checked: l.threeD, action: () => A.toggle3D(l.id) },
          { label: "Pre-componi…", keys: "Ctrl+Maiusc+C", action: () => st.set({ dialog: { type: "precompose" } }) },
          ...(l.type === "solid" ? ([{ label: "Impostazioni tinta unita…", keys: "Ctrl+Maiusc+Y", action: () => st.set({ dialog: { type: "solid", layerId: l.id } }) }] as MenuItemLike[]) : []),
          { label: "Trasforma", sub: [
            { label: "Ripristina", action: () => A.updateLayer(l.id, (x) => ({ ...x, transform: { ...x.transform, rotation: { value: [0], keys: null }, scale: { value: [100, 100], keys: null }, opacity: { value: [100], keys: null } } }), "Ripristina") },
            { label: "Centra punto di ancoraggio nel contenuto del livello", keys: "Ctrl+Alt+Home", action: A.centerAnchor },
            { label: "Centra il livello nella vista", keys: "Ctrl+Home", action: A.centerLayer },
            { label: "Adatta alla composizione", keys: "Ctrl+Alt+F", action: () => A.fitToComp("fit") },
            { label: "Adatta alla larghezza della composizione", action: () => A.fitToComp("width") },
            { label: "Adatta all'altezza della composizione", action: () => A.fitToComp("height") },
          ] },
          { label: "Tempo", sub: [{ label: "Inverti tempo livello", keys: "Ctrl+Alt+R", action: A.reverseLayer }] },
          { label: "Fusione", sub: BLEND_MODES.map(([n], i) => ({ label: n, checked: l.blend === i, action: () => A.updateLayer(l.id, (x) => ({ ...x, blend: i }), "Metodo fusione") })) },
          "-",
          { label: "Duplica", keys: "Ctrl+D", action: A.duplicate },
          { label: "Dividi livello", keys: "Ctrl+Maiusc+D", action: A.splitLayer },
          { label: "Elimina", keys: "Canc", action: A.deleteSelected },
          "-",
          { label: "Etichetta", sub: AE_LABELS.map(([n], i) => ({ label: n, checked: l.label === i, action: () => A.updateLayer(l.id, (x) => ({ ...x, label: i }), "Etichetta") })) },
        ],
      },
    });
  };

  const secStep = [1 / fps, 5 / fps, 15 / fps, 0.5, 1, 2, 5, 10].find((s) => s * pps >= 50) ?? 10;
  const ticks = Array.from({ length: Math.floor(comp.duration / secStep) + 1 }, (_, i) => i * secStep);
  const tickLabel = (x: number) => {
    const f = Math.round(x * fps);
    const s = Math.floor(f / Math.round(fps));
    const ff = f % Math.round(fps);
    return ff === 0 ? `${String(s).padStart(2, "0")}:00f` : `${ff}f`;
  };

  const selectedKeysSet = new Set(st.selectedKeys);
  const graphProps = st.graph
    ? comp.layers.flatMap((l) =>
        layerProps(l)
          .filter((p) => (st.selectedProps.length ? st.selectedProps.includes(`${l.id}|${p.path}`) : sel.includes(l.id) && p.prop.keys))
          .map((p) => ({ l, ...p })),
      )
    : [];

  return (
    <div className="flex h-full flex-col text-[12px]">
      {/* barra superiore */}
      <div className="flex h-[44px] shrink-0 items-center gap-3 px-3">
        <div className="w-[96px] leading-tight">
          <div className="font-mono text-[16px] text-[#3d9cf0]">{aeTime(t, fps)}</div>
          <div className="text-[10px] text-[#2d7bc4]">
            {String(Math.round(t * fps)).padStart(5, "0")} ({fps.toFixed(2)} fps)
          </div>
        </div>
        <label className="flex h-6 w-56 items-center gap-1 rounded border border-[#3a3a3a] bg-[#151515] px-2">
          <Search size={12} className="text-[#8a8a8a]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="min-w-0 flex-1 bg-transparent text-[#e0e0e0] outline-none" />
        </label>
        <div className="flex items-center gap-1 text-[#bdbdbd]" style={{ marginLeft: Math.max(8, LEFT - 96 - 224 - 3 * 12 - 180) }}>
          {(
            [
              ["Bozza 3D", <Box key="b" size={14} />, false, () => st.notify("Bozza 3D: anteprima 3D veloce")],
              ["Nascondi tutti i livelli shy", <EyeOff key="s" size={14} />, st.hideShy, () => st.set({ hideShy: !st.hideShy })],
              ["Attiva la fusione fotogrammi", <Layers key="f" size={14} />, false, () => st.notify("Fusione fotogrammi")],
              ["Attiva la sfocatura di movimento", <CircleDot key="m" size={14} />, false, () => st.notify("Sfocatura di movimento: attivala per livello con l'interruttore")],
              ["Editor grafico (Maiusc+F3)", <LineChart key="g" size={14} />, st.graph, () => st.set({ graph: !st.graph })],
            ] as const
          ).map(([title, icon, on, fn]) => (
            <button key={title} type="button" title={title} onClick={fn} className={clsx("grid h-6 w-7 place-items-center rounded", on ? "bg-[#3a3a3a] text-white" : "hover:bg-white/10")}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scroller}
        className="relative min-h-0 flex-1 overflow-auto [scrollbar-color:#4a4a4a_transparent]"
        onWheel={(e) => {
          if (e.altKey || e.ctrlKey) {
            e.preventDefault();
            st.set({ zooms: { ...st.zooms, [comp.id]: Math.max(10, Math.min(3000, pps * (e.deltaY < 0 ? 1.2 : 0.83))) } });
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const item = e.dataTransfer.getData("text/x-ae-item");
          const fx = e.dataTransfer.getData("text/x-fx");
          if (fx) return A.applyEffect(fx);
          const it = st.project.items.find((i) => i.id === item);
          if (it?.type === "footage") A.addMediaLayer(it.ref!);
          if (it?.type === "comp") A.addCompLayer(it.ref!);
        }}
      >
        <div className="relative" style={{ width: LEFT + width + 40, minHeight: "100%" }}>
          {/* intestazione colonne + righello */}
          <div className="sticky top-0 z-30 flex h-[28px] border-b border-[#111] bg-[#232323]">
            <div className="sticky left-0 z-10 flex shrink-0 items-center bg-[#232323] text-[11px] text-[#bdbdbd]" style={{ width: LEFT }}>
              <span className="flex w-[74px] justify-around">
                <Eye size={12} />
                <Volume2 size={12} />
                <span className="h-2 w-2 rounded-full bg-[#bdbdbd]" />
                <Lock size={11} />
              </span>
              <span className="w-[18px]">◆</span>
              <span className="w-[22px]">#</span>
              <button type="button" onClick={() => st.set({ sourceName: !st.sourceName })} className="flex-1 text-left hover:text-white">
                {st.sourceName ? "Nome sorgente" : "Nome livello"}
              </button>
              {st.modes ? (
                <span className="flex w-[200px] justify-between pr-3">
                  <span>Modalità</span>
                  <span>T</span>
                  <span>TrkMat</span>
                </span>
              ) : (
                <span className="flex w-[150px] justify-around" title="Shy · Comprimi · Qualità · Effetto · Fusione fotogrammi · Sfocatura movimento · Livello di regolazione · Livello 3D">
                  <span>⌒</span>
                  <span>☀</span>
                  <span>\</span>
                  <span className="italic">fx</span>
                  <span>▦</span>
                  <span>◑</span>
                  <span>◐</span>
                  <span>⬡</span>
                </span>
              )}
              <span className="w-[130px] pl-2">Principale e collega</span>
            </div>
            <div
              className="relative shrink-0 cursor-pointer"
              style={{ width: width + 40 }}
              onPointerDown={(e) => {
                try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
                st.set({ playing: false });
                st.setTime(toFrame(xToTime(e.clientX)));
              }}
              onPointerMove={(e) => e.buttons & 1 && st.setTime(toFrame(xToTime(e.clientX)))}
            >
              {/* area di lavoro */}
              <div className="absolute top-[2px] h-[7px] rounded-sm bg-[#5a5a6e]" style={{ left: comp.workIn * pps, width: (comp.workOut - comp.workIn) * pps }}>
                {(["workIn", "workOut"] as const).map((k) => (
                  <div
                    key={k}
                    className="absolute top-[-1px] h-[9px] w-[6px] cursor-ew-resize rounded-sm bg-[#3d9cf0]"
                    style={{ [k === "workIn" ? "left" : "right"]: -3 }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      drag(e, (ev) => st.commitComp((c) => ({ ...c, [k]: toFrame(k === "workIn" ? Math.min(xToTime(ev.clientX), c.workOut - 1 / fps) : Math.max(xToTime(ev.clientX), c.workIn + 1 / fps)) }), "Area di lavoro", "wa"));
                    }}
                  />
                ))}
              </div>
              {ticks.map((x, i) => (
                <div key={i} className="absolute bottom-0 border-l border-[#5a5a5a]" style={{ left: x * pps, height: 6 }}>
                  <span className="absolute -top-[14px] -translate-x-1/2 whitespace-nowrap text-[10.5px] text-[#bdbdbd]">{tickLabel(x)}</span>
                </div>
              ))}
              <div className="absolute bottom-[-1px] h-[2px] bg-[#2fbf5a]" style={{ left: 0, width: width }} />
              <div className="pointer-events-none absolute bottom-0 z-10 -translate-x-1/2" style={{ left: t * pps }}>
                <div className="h-[12px] w-[11px] bg-[#3d9cf0]" style={{ clipPath: "polygon(0 0,100% 0,100% 55%,50% 100%,0 55%)" }} />
              </div>
            </div>
          </div>

          {rows.map((r, ri) => {
            if (r.kind === "layer") {
              const l = r.l;
              const isSel = sel.includes(l.id);
              const color = AE_LABELS[l.label]?.[1] ?? "#888";
              const m = l.source ? st.project.media[l.source] : undefined;
              const Icon = l.type === "text" ? Type : l.type === "shape" ? Square : l.type === "precomp" ? Layers : Film;
              const tw = (k: keyof Layer, v: boolean, label: string) => A.updateLayer(l.id, (x) => ({ ...x, [k]: v }), label);
              return (
                <div key={l.id} className={clsx("flex border-b border-[#191919]", isSel ? "bg-[#3d3d50]" : "bg-[#262626]")} style={{ height: ROW }} onContextMenu={(e) => layerMenu(e, l)}>
                  <div
                    className="sticky left-0 z-10 flex shrink-0 items-center"
                    style={{ width: LEFT, background: isSel ? "#3d3d50" : "#262626" }}
                    onPointerDown={(e) => {
                      if ((e.target as HTMLElement).closest("button,select,input")) return;
                      st.set({ selected: e.ctrlKey || e.metaKey ? (isSel ? sel.filter((x) => x !== l.id) : [...sel, l.id]) : e.shiftKey && sel.length ? comp.layers.slice(Math.min(r.i, comp.layers.findIndex((x) => x.id === sel[0])), Math.max(r.i, comp.layers.findIndex((x) => x.id === sel[0])) + 1).map((x) => x.id) : [l.id], selectedProps: [] });
                      // trascinare in verticale riordina i livelli
                      const y0 = e.clientY;
                      st.beginGesture();
                      drag(
                        e,
                        (_ev, _dx, dy) => {
                          const steps = Math.round(dy / ROW);
                          st.updateGesture((c) => {
                            const arr = c.layers.filter((x) => x.id !== l.id);
                            const idx = Math.max(0, Math.min(arr.length, r.i + steps));
                            return { ...c, layers: [...arr.slice(0, idx), l, ...arr.slice(idx)] };
                          });
                          void y0;
                        },
                        () => st.endGesture("Disponi livelli"),
                      );
                    }}
                    onDoubleClick={() => (l.type === "precomp" && l.source ? st.openComp(l.source) : setRename(l.id))}
                  >
                    <span className="flex w-[74px] items-center justify-around text-[#bdbdbd]">
                      <button type="button" title="Video" onClick={() => tw("visible", !l.visible, "Visibilità")}>
                        {l.visible ? <Eye size={12} /> : <span className="block h-3 w-3" />}
                      </button>
                      <button type="button" title="Audio" onClick={() => l.source && tw("audio", !l.audio, "Audio")} className={clsx(!m?.hasAudio && "opacity-0")}>
                        <Volume2 size={12} className={l.audio ? "" : "opacity-30"} />
                      </button>
                      <button type="button" title="Solo" onClick={() => tw("solo", !l.solo, "Solo")} className={clsx("h-2.5 w-2.5 rounded-full border border-[#8a8a8a]", l.solo && "bg-[#e8d43a]")} />
                      <button type="button" title="Blocco" onClick={() => tw("locked", !l.locked, "Blocca")}>
                        {l.locked ? <Lock size={11} /> : <LockOpen size={11} className="opacity-25" />}
                      </button>
                    </span>
                    <span className="mr-[6px] h-[11px] w-[12px] shrink-0 rounded-[2px]" style={{ background: color }} />
                    <span className="w-[22px] text-[#bdbdbd]">{r.i + 1}</span>
                    <span className="flex min-w-0 flex-1 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const o = { ...st.open };
                          if (o[l.id]) delete o[l.id];
                          else o[l.id] = "all";
                          st.set({ open: o });
                        }}
                        className="text-[#9a9a9a]"
                      >
                        {st.open[l.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                      <Icon size={12} className="shrink-0 text-[#bdbdbd]" />
                      {rename === l.id ? (
                        <input
                          autoFocus
                          defaultValue={l.name}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            if (e.key === "Escape") setRename(null);
                          }}
                          onBlur={(e) => {
                            A.updateLayer(l.id, (x) => ({ ...x, name: e.target.value || x.name }), "Rinomina livello");
                            setRename(null);
                          }}
                          className="h-4 min-w-0 flex-1 border border-[#2680eb] bg-[#111] px-1 text-[12px] text-white outline-none"
                        />
                      ) : (
                        <span className={clsx("truncate", isSel ? "text-white" : "text-[#d6d6d6]")}>{st.sourceName && m ? m.name : l.name}</span>
                      )}
                    </span>
                    {st.modes ? (
                      <span className="flex w-[200px] items-center gap-2 pr-3">
                        <select value={l.blend} onChange={(e) => A.updateLayer(l.id, (x) => ({ ...x, blend: Number(e.target.value) }), "Metodo fusione")} className="h-4 w-[110px] rounded-sm border border-[#3e3e3e] bg-[#151515] text-[11px] text-[#d0d0d0] outline-none">
                          {BLEND_MODES.map(([n], i) => (
                            <option key={n} value={i}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <span className="text-[#6a6a6a]">Nessuno</span>
                      </span>
                    ) : (
                      <span className="flex w-[150px] items-center justify-around text-[#bdbdbd]">
                        <button type="button" title="Shy" onClick={() => tw("shy", !l.shy, "Shy")} className={l.shy ? "text-white" : "opacity-40"}>
                          ⌒
                        </button>
                        <span className="opacity-30">☀</span>
                        <span>\</span>
                        <button type="button" title="Effetto" onClick={() => tw("fxOn", !l.fxOn, "Effetti")} className={clsx("italic", !l.effects.length && "opacity-0", !l.fxOn && "line-through opacity-50")}>
                          fx
                        </button>
                        <span className="opacity-30">▦</span>
                        <button type="button" title="Sfocatura di movimento" onClick={() => tw("motionBlur", !l.motionBlur, "Sfocatura di movimento")} className={l.motionBlur ? "text-white" : "opacity-30"}>
                          ◑
                        </button>
                        <button type="button" title="Livello di regolazione" className={l.type === "adjustment" ? "text-white" : "opacity-30"}>
                          ◐
                        </button>
                        <button type="button" title="Livello 3D" onClick={() => A.toggle3D(l.id)} className={l.threeD ? "text-white" : "opacity-30"}>
                          ⬡
                        </button>
                      </span>
                    )}
                    <span className="flex w-[130px] items-center gap-1 pl-2">
                      <span className="text-[#9a9a9a]" title="Selettore di collegamento">
                        @
                      </span>
                      <select value={l.parent ?? ""} onChange={(e) => A.parentTo(l.id, e.target.value || null)} className="h-4 min-w-0 flex-1 rounded-sm border border-[#3e3e3e] bg-[#151515] text-[11px] text-[#d0d0d0] outline-none">
                        <option value="">Nessuno</option>
                        {comp.layers
                          .filter((x) => x.id !== l.id)
                          .map((x) => (
                            <option key={x.id} value={x.id}>
                              {comp.layers.indexOf(x) + 1}. {x.name}
                            </option>
                          ))}
                      </select>
                    </span>
                  </div>
                  <div className="relative shrink-0" style={{ width: width + 40 }}>
                    {!st.graph && (
                      <div
                        className="absolute top-[3px] cursor-grab rounded-[2px]"
                        style={{ left: l.inPoint * pps, width: Math.max(2, (l.outPoint - l.inPoint) * pps), height: ROW - 6, background: color, opacity: isSel ? 0.85 : 0.55, boxShadow: isSel ? "inset 0 0 0 1px #fff" : undefined }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (l.locked) return;
                          if (!isSel) st.set({ selected: [l.id] });
                          const startIn = l.inPoint;
                          st.beginGesture();
                          drag(
                            e,
                            (_ev, dx) => {
                              const dt = toFrame(dx / pps);
                              st.updateGesture((c) => ({ ...c, layers: c.layers.map((x) => (x.id === l.id ? shiftLayer(l, dt) : x)) }));
                              void startIn;
                            },
                            () => st.endGesture("Sposta livello"),
                          );
                        }}
                      >
                        {(["in", "out"] as const).map((edge) => (
                          <div
                            key={edge}
                            className={clsx("absolute inset-y-0 w-[6px] cursor-ew-resize", edge === "in" ? "left-0" : "right-0")}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              if (l.locked) return;
                              st.beginGesture();
                              drag(
                                e,
                                (_ev, dx) => {
                                  const dt = toFrame(dx / pps);
                                  st.updateGesture((c) => ({
                                    ...c,
                                    layers: c.layers.map((x) =>
                                      x.id === l.id ? (edge === "in" ? { ...x, inPoint: Math.max(0, Math.min(l.outPoint - 1 / fps, l.inPoint + dt)) } : { ...x, outPoint: Math.min(c.duration, Math.max(l.inPoint + 1 / fps, l.outPoint + dt)) }) : x,
                                    ),
                                  }));
                                },
                                () => st.endGesture("Rifila livello"),
                              );
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {!st.open[l.id] &&
                      !st.graph &&
                      [...new Set(layerProps(l).flatMap((p) => p.prop.keys?.map((k) => k.t) ?? []))].map((kt) => (
                        <span key={kt} className="pointer-events-none absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#d0d0d0]/80" style={{ left: kt * pps }} />
                      ))}
                  </div>
                </div>
              );
            }
            if (r.kind === "group") {
              const id = r.l.id + r.id;
              const c = collapsed.has(id);
              return (
                <div key={id + ri} className="flex border-b border-[#1b1b1b] bg-[#232323]" style={{ height: ROW }}>
                  <div className="sticky left-0 z-10 flex shrink-0 items-center gap-1 bg-[#232323] pr-2 text-[#d0d0d0]" style={{ width: LEFT, paddingLeft: 96 + r.depth * 14 }}>
                    <button type="button" onClick={() => setCollapsed((s) => (s.has(id) ? new Set([...s].filter((x) => x !== id)) : new Set([...s, id])))} className="text-[#9a9a9a]">
                      {c ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {r.extra && <span className="mr-1">{r.extra}</span>}
                    <span className="truncate">{r.name}</span>
                    {r.onReset && (
                      <button type="button" onClick={r.onReset} className="ml-4 text-[#3d9cf0] hover:underline">
                        Ripristina
                      </button>
                    )}
                  </div>
                  <div className="shrink-0" style={{ width: width + 40 }} />
                </div>
              );
            }
            if (r.kind === "expr") {
              const p = getProp(r.l, r.path);
              const res = p?.expr ? valueAt(p, t) : null;
              void res;
              return (
                <div key={r.l.id + r.path + "x"} className="flex border-b border-[#1b1b1b] bg-[#202020]" style={{ minHeight: ROW * 2 }}>
                  <div className="sticky left-0 z-10 flex shrink-0 items-start gap-2 bg-[#202020] py-1 pr-2" style={{ width: LEFT, paddingLeft: 96 + 3 * 14 }}>
                    <span className="pt-0.5 text-[11px] text-[#e8d43a]">Espressione:</span>
                  </div>
                  <textarea
                    defaultValue={p?.expr}
                    spellCheck={false}
                    onKeyDown={(e) => e.stopPropagation()}
                    onBlur={(e) => A.updateLayer(r.l.id, (x) => withProp(x, r.path, { ...getProp(x, r.path)!, expr: e.target.value }), "Modifica espressione")}
                    className="sticky z-10 m-1 h-10 w-[420px] shrink-0 resize-y rounded-sm border border-[#3e3e3e] bg-[#151515] p-1 font-mono text-[11.5px] text-[#e8d43a] outline-none focus:border-[#2680eb]"
                    style={{ left: LEFT }}
                  />
                </div>
              );
            }
            // proprietà
            const l = r.l;
            const p = r.path.includes(".") && !r.path.startsWith("text") && !["s.fill", "s.stroke"].includes(r.path) ? getProp(l, r.path) : undefined;
            const v = p ? valueAt(p, t, { index: comp.layers.indexOf(l) + 1, fps, width: comp.width, height: comp.height }) : [];
            const keys = p?.keys ?? [];
            const onKey = keys.find((k) => Math.abs(k.t - t) < 0.5 / fps);
            const pid = `${l.id}|${r.path}`;
            const propSel = st.selectedProps.includes(pid);
            const setP = (np: Prop, key?: string) => A.updateLayer(l.id, (x) => withProp(x, r.path, np), "Modifica valore", key);
            return (
              <div key={pid} className={clsx("flex border-b border-[#1b1b1b]", propSel ? "bg-[#2b2b3a]" : "bg-[#232323]")} style={{ height: ROW }}>
                <div
                  className="sticky left-0 z-10 flex shrink-0 items-center gap-1.5 pr-2"
                  style={{ width: LEFT, paddingLeft: 96 + r.depth * 14, background: propSel ? "#2b2b3a" : "#232323" }}
                  onPointerDown={(e) => {
                    if ((e.target as HTMLElement).closest("button,select,input,[role=spinbutton]")) return;
                    st.set({ selectedProps: e.shiftKey ? [...st.selectedProps, pid] : [pid], selected: [l.id], selectedKeys: keys.map((k) => k.id) });
                  }}
                >
                  {p ? (
                    <button
                      type="button"
                      title="Cronometro (Alt+clic: espressione)"
                      onClick={(e) => (e.altKey ? A.toggleStopwatchAlt(l.id, r.path) : setP(toggleStopwatch(p, t, fps)))}
                      className="shrink-0"
                    >
                      {STOP(!!p.keys, p.expr !== undefined)}
                    </button>
                  ) : (
                    <span className="w-[14px]" />
                  )}
                  <span className="w-[150px] shrink-0 truncate text-[#d0d0d0]">{r.name}</span>
                  <span className="flex min-w-0 flex-1 items-center gap-2.5">
                    {r.input ??
                      v.slice(0, r.dims).map((x, d) => (
                        <Scrub
                          key={d}
                          value={x}
                          step={r.unit?.step ?? 1}
                          decimals={r.unit?.decimals ?? 1}
                          suffix={r.dims > 1 && d < r.dims - 1 ? "," : r.unit?.suffix ?? ""}
                          min={r.unit?.min}
                          max={r.unit?.max}
                          disabled={p?.expr !== undefined}
                          onChange={(nv) => {
                            const cur = valueAt(p!, t);
                            const n = [...cur];
                            n[d] = nv;
                            if (r.path === "t.scale" && d === 0 && Math.abs(cur[0] - cur[1]) < 1e-6) n[1] = nv; // proporzioni vincolate
                            setP(setAt(p!, n, t, fps), pid + d);
                          }}
                        />
                      ))}
                  </span>
                  {p?.keys && (
                    <span className="flex shrink-0 items-center text-[#bdbdbd]">
                      <button type="button" title="Fotogramma chiave precedente" onClick={() => A.goKey(-1)} className="px-0.5 text-[9px]">
                        ◀
                      </button>
                      <button type="button" title="Aggiungi/rimuovi fotogramma chiave" onClick={() => A.toggleKey(l.id, r.path)}>
                        <svg width="10" height="10" viewBox="-6 -6 12 12">
                          <path d="M0 -5L5 0L0 5L-5 0Z" fill={onKey ? "#3d9cf0" : "none"} stroke="#d0d0d0" />
                        </svg>
                      </button>
                      <button type="button" title="Fotogramma chiave successivo" onClick={() => A.goKey(1)} className="px-0.5 text-[9px]">
                        ▶
                      </button>
                    </span>
                  )}
                </div>
                <div
                  className="relative shrink-0"
                  style={{ width: width + 40 }}
                  onPointerDown={(e) => {
                    if (e.target !== e.currentTarget || st.graph) return;
                    // selezione a riquadro dei keyframe
                    const el = scroller.current!;
                    const rect = el.getBoundingClientRect();
                    const x0 = e.clientX - rect.left + el.scrollLeft;
                    const y0 = e.clientY - rect.top + el.scrollTop;
                    if (!e.shiftKey) st.set({ selectedKeys: [] });
                    drag(
                      e,
                      (ev) => {
                        const x1 = ev.clientX - rect.left + el.scrollLeft;
                        const y1 = ev.clientY - rect.top + el.scrollTop;
                        setBox({ x0, y0, x1, y1 });
                        const ta = (Math.min(x0, x1) - LEFT) / pps;
                        const tb = (Math.max(x0, x1) - LEFT) / pps;
                        const ids: string[] = [];
                        el.querySelectorAll<HTMLElement>("[data-key]").forEach((n) => {
                          const kt = Number(n.dataset.t);
                          const ky = n.getBoundingClientRect().top + n.offsetHeight / 2 - rect.top + el.scrollTop;
                          if (kt >= ta && kt <= tb && ky >= Math.min(y0, y1) && ky <= Math.max(y0, y1)) ids.push(n.dataset.key!);
                        });
                        st.set({ selectedKeys: ids });
                      },
                      () => setBox(null),
                    );
                  }}
                >
                  {!st.graph &&
                    keys.map((k) => (
                      <span
                        key={k.id}
                        data-key={k.id}
                        data-t={k.t}
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ left: k.t * pps }}
                        onContextMenu={(e) => keyMenu(e, l, r.path, k)}
                        onDoubleClick={() => st.setTime(k.t)}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          const selIds = e.shiftKey ? (selectedKeysSet.has(k.id) ? st.selectedKeys.filter((x) => x !== k.id) : [...st.selectedKeys, k.id]) : selectedKeysSet.has(k.id) ? st.selectedKeys : [k.id];
                          st.set({ selectedKeys: selIds, selected: [l.id] });
                          const ids = new Set(selIds);
                          st.beginGesture();
                          drag(
                            e,
                            (_ev, dx) => {
                              const dt = toFrame(dx / pps);
                              st.updateGesture((c) => ({ ...c, layers: c.layers.map((x) => ({ ...x, ...mapLayerKeys(x, ids, dt, c.duration) })) }));
                            },
                            () => st.endGesture("Sposta fotogrammi chiave"),
                          );
                        }}
                      >
                        <KeyGlyph k={k} selected={selectedKeysSet.has(k.id)} size={11} />
                      </span>
                    ))}
                </div>
              </div>
            );
          })}
          {st.graph && <GraphEditor comp={comp} props={graphProps} pps={pps} top={28} />}
          {box && <div className="pointer-events-none absolute z-40 border border-white/80 bg-white/10" style={{ left: Math.min(box.x0, box.x1), top: Math.min(box.y0, box.y1), width: Math.abs(box.x1 - box.x0), height: Math.abs(box.y1 - box.y0) }} />}
          <div className="pointer-events-none absolute bottom-0 top-[28px] z-20 w-px bg-[#3d9cf0]" style={{ left: LEFT + t * pps }} />
          <div className="absolute" style={{ height: 40, top: 28 + rows.length * ROW }} />
        </div>
      </div>
      <div className="flex h-[26px] shrink-0 items-center gap-4 border-t border-[#111] px-3 text-[11.5px] text-[#bdbdbd]">
        <span>
          Tempo di rendering fotogramma: <span className="text-[#3ecf8e]">{st.playing ? "4ms" : "0ms"}</span>
        </span>
        <button type="button" onClick={() => st.set({ modes: !st.modes })} className="hover:text-white">
          Passa a switch o modalità
        </button>
        <input
          type="range"
          min={10}
          max={2000}
          value={pps}
          onChange={(e) => st.set({ zooms: { ...st.zooms, [comp.id]: Number(e.target.value) } })}
          className="ml-auto h-1 w-40 accent-[#bdbdbd]"
          aria-label="Zoom timeline"
        />
      </div>
    </div>
  );
}

function mapLayerKeys(l: Layer, ids: Set<string>, dt: number, max: number): Partial<Layer> {
  let out = l;
  for (const { path, prop: p } of layerProps(l)) {
    if (!p.keys?.some((k) => ids.has(k.id))) continue;
    out = withProp(out, path, mapKeys(p, (k) => (ids.has(k.id) ? { ...k, t: Math.max(0, Math.min(max, k.t + dt)) } : k)));
  }
  return out;
}

/** Editor grafico: curve del valore (o della velocità) delle proprietà scelte. */
function GraphEditor({ comp, props, pps, top }: { comp: Comp; props: { l: Layer; path: string; name: string; prop: Prop }[]; pps: number; top: number }) {
  const st = useAe();
  const [speed, setSpeed] = useState(false);
  const H = 260;
  const dt = 1 / comp.fps;
  const curves = props.map(({ l, path, prop }) => {
    const vals: number[][] = [];
    const sp: number[] = [];
    for (let x = 0; x <= comp.duration + 1e-6; x += dt) {
      const v = valueAt(prop, x);
      vals.push(v);
      const v2 = valueAt(prop, Math.min(comp.duration, x + dt));
      sp.push(Math.hypot(...v.map((a, d) => (v2[d] - a) / dt)));
    }
    return { l, path, prop, vals, sp };
  });
  const all = speed ? curves.flatMap((c) => c.sp) : curves.flatMap((c) => c.vals.flat());
  const min = speed ? 0 : Math.min(0, ...all);
  const max = Math.max(1, ...all);
  const y = (v: number) => H - 20 - ((v - min) / (max - min || 1)) * (H - 40);
  const colors = ["#ff6b6b", "#5fd38a", "#5aa9ff", "#e8d43a", "#d966d6"];
  return (
    <div className="absolute z-20 border-t border-black bg-[#1b1b1b]" style={{ left: LEFT, top, width: comp.duration * pps + 40, height: H + 34 }}>
      <div className="flex items-center gap-3 px-2 py-1 text-[11px] text-[#9a9a9a]">
        <button type="button" onClick={() => setSpeed(false)} className={!speed ? "text-white underline" : ""}>
          Grafico valore
        </button>
        <button type="button" onClick={() => setSpeed(true)} className={speed ? "text-white underline" : ""}>
          Grafico velocità
        </button>
        <span>{props.length ? props.map((p) => `${p.l.name} › ${p.name}`).join(", ") : "Seleziona una proprietà animata (clic sul nome) per vederne la curva"}</span>
        <span className="ml-auto flex gap-1">
          {(
            [
              ["Easy Ease", "ease"],
              ["Ease in", "easeIn"],
              ["Ease out", "easeOut"],
              ["Lineare", "linear"],
              ["Tenuta", "hold"],
            ] as const
          ).map(([n, k]) => (
            <button key={k} type="button" onClick={() => A.setInterp(k)} className="rounded bg-[#2e2e2e] px-2 py-0.5 text-[#d0d0d0] hover:bg-[#3a3a3a]">
              {n}
            </button>
          ))}
        </span>
      </div>
      <svg width={comp.duration * pps + 40} height={H} className="block">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2="100%" y1={H * f} y2={H * f} stroke="#2a2a2a" />
        ))}
        {curves.map((c, ci) =>
          speed ? (
            <polyline key={ci} points={c.sp.map((s, i) => `${i * dt * pps},${y(s)}`).join(" ")} fill="none" stroke={colors[ci % 5]} strokeWidth="1.6" />
          ) : (
            c.vals[0].map((_, d) => <polyline key={ci + "-" + d} points={c.vals.map((v, i) => `${i * dt * pps},${y(v[d])}`).join(" ")} fill="none" stroke={colors[(ci + d) % 5]} strokeWidth="1.6" />)
          ),
        )}
        {curves.flatMap((c) =>
          (c.prop.keys ?? []).map((k) => {
            const vy = speed ? y(c.sp[Math.min(c.sp.length - 1, Math.round(k.t / dt))]) : y(k.v[0]);
            return (
              <rect
                key={k.id}
                x={k.t * pps - 4}
                y={vy - 4}
                width="8"
                height="8"
                fill={st.selectedKeys.includes(k.id) ? "#3d9cf0" : "#fff"}
                stroke="#000"
                className="cursor-pointer"
                onPointerDown={(e) => st.set({ selectedKeys: e.shiftKey ? [...st.selectedKeys, k.id] : [k.id] })}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

export { withKind };
