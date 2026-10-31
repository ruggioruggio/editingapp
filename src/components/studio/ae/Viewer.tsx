"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { Camera, ChevronDown, Grid3x3, Image as ImageIcon } from "lucide-react";
import { prop, setAt, uid, valueAt } from "@/lib/studio/anim";
import { textCss } from "@/lib/studio/text";
import { compOf, timeOf, useAe, type Comp, type Layer, type Mask } from "@/lib/studio/ae";
import { Stage } from "../render";
import { usePlayback } from "../chrome";
import { CompAudio, CompFrame, layerTransform } from "./compose";
import { aeTime } from "./AeTimeline";
import * as A from "./actions";

function toLayerSpace(l: Layer, t: number, comp: Comp, p: [number, number]): [number, number] {
  const tf = layerTransform(l, t, comp, 1);
  const r = (-tf.rot * Math.PI) / 180;
  const dx = p[0] - tf.pos[0];
  const dy = p[1] - tf.pos[1];
  const x = (dx * Math.cos(r) - dy * Math.sin(r)) / ((tf.scale[0] || 100) / 100);
  const y = (dx * Math.sin(r) + dy * Math.cos(r)) / ((tf.scale[1] || 100) / 100);
  return [x + tf.anchor[0], y + tf.anchor[1]];
}

function newMask(l: Layer, kind: Mask["kind"], path: number[]): Mask {
  return { id: uid("mk"), name: `Maschera ${l.masks.length + 1}`, mode: "add", inverted: false, kind, path, feather: prop(0), opacity: prop(100), expansion: prop(0) };
}

export function Viewer() {
  const st = useAe();
  const comp = compOf(st);
  const t = timeOf(st);
  const [draft, setDraft] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [res, setRes] = useState("Piena");
  const [grid, setGrid] = useState(false);
  const [checker, setChecker] = useState(false);
  const scaleRef = useRef(1);

  usePlayback(st.playing && !!comp, (dt) => {
    const s = useAe.getState();
    const c = compOf(s);
    if (!c) return;
    let n = timeOf(s) + dt;
    if (n >= c.workOut) n = c.workIn;
    s.set({ times: { ...s.times, [c.id]: n } });
  });

  if (!comp) return <div className="grid h-full place-items-center text-[12px] text-[#8a8a8a]">Nessuna composizione</div>;
  const sel = comp.layers.filter((l) => st.selected.includes(l.id) && t >= l.inPoint && t < l.outPoint);
  const editLayer = st.editingText ? comp.layers.find((l) => l.id === st.editingText) : undefined;
  const snapP = (x: number, y: number): [number, number] => {
    if (!st.snapping) return [x, y];
    const lim = 14 / scaleRef.current;
    const sx = [0, comp.width / 2, comp.width].find((v) => Math.abs(v - x) < lim);
    const sy = [0, comp.height / 2, comp.height].find((v) => Math.abs(v - y) < lim);
    return [sx ?? x, sy ?? y];
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>, toLocal: (x: number, y: number) => [number, number], scale: number) => {
    scaleRef.current = scale;
    const el = e.currentTarget;
    const [x, y] = toLocal(e.clientX, e.clientY);
    const tool = st.tool;
    if (tool === "hand" || tool === "zoom") {
      if (tool === "zoom") st.set({ viewerZoom: Math.max(5, Math.min(800, (st.viewerZoom === "fit" ? scale * 100 : st.viewerZoom) * (e.altKey ? 0.5 : 2))) });
      return;
    }
    if (tool === "text" || tool === "vtext") {
      const l = A.addLayer("text", { transform: { ...newTf(x, y) } });
      if (l) st.set({ editingText: l.id, tool: "select" });
      return;
    }
    if (tool === "pen") {
      const target = comp.layers.find((l) => st.selected.includes(l.id) && l.type !== "text" && l.type !== "shape" && l.type !== "null");
      if (!target) return st.notify("Seleziona un livello (metraggio o tinta unita) su cui disegnare la maschera");
      const p = toLayerSpace(target, t, comp, [x, y]);
      const d = st.maskDraft?.layer === target.id ? st.maskDraft.pts : [];
      if (d.length >= 6 && Math.hypot(d[0] - p[0], d[1] - p[1]) < 14 / scale) {
        A.updateLayer(target.id, (l) => ({ ...l, masks: [...l.masks, newMask(l, "poly", d)] }), "Nuova maschera");
        st.set({ maskDraft: null, open: { ...st.open, [target.id]: ["masks"] } });
      } else st.set({ maskDraft: { layer: target.id, pts: [...d, p[0], p[1]] } });
      return;
    }
    if (["rect", "rrect", "ellipse", "polygon", "star"].includes(tool)) {
      try { el.setPointerCapture(e.pointerId); } catch {}
      setDraft({ x0: x, y0: y, x1: x, y1: y });
      const move = (ev: PointerEvent) => {
        const [x1, y1] = toLocal(ev.clientX, ev.clientY);
        setDraft({ x0: x, y0: y, x1, y1 });
      };
      const up = (ev: PointerEvent) => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        setDraft(null);
        const [x1, y1] = toLocal(ev.clientX, ev.clientY);
        const w = Math.max(10, Math.abs(x1 - x));
        const h = Math.max(10, Math.abs(y1 - y));
        const target = comp.layers.find((l) => st.selected.includes(l.id) && (l.type === "footage" || l.type === "solid" || l.type === "precomp" || l.type === "adjustment"));
        if (target && (tool === "rect" || tool === "rrect" || tool === "ellipse")) {
          const a = toLayerSpace(target, t, comp, [Math.min(x, x1), Math.min(y, y1)]);
          const b = toLayerSpace(target, t, comp, [Math.max(x, x1), Math.max(y, y1)]);
          A.updateLayer(target.id, (l) => ({ ...l, masks: [...l.masks, newMask(l, tool === "ellipse" ? "ellipse" : "rect", [a[0], a[1], b[0] - a[0], b[1] - a[1]])] }), "Nuova maschera");
          st.set({ open: { ...st.open, [target.id]: ["masks"] } });
          return;
        }
        const kind = tool === "ellipse" ? "ellipse" : tool === "polygon" ? "polygon" : tool === "star" ? "star" : "rect";
        const l = A.addLayer("shape", { transform: newTf((x + x1) / 2, (y + y1) / 2) });
        if (l)
          A.updateLayer(l.id, (k) => ({ ...k, name: `Livello forma ${comp.layers.filter((z) => z.type === "shape").length + 1}`, shape: { ...k.shape!, kind, size: prop(Math.round(w), Math.round(h)), roundness: prop(tool === "rrect" ? 30 : 0), points: tool === "polygon" ? 6 : 5 } }), "Nuova forma");
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      return;
    }
    const hit = hitTest(comp, t, x, y);
    if (!hit) {
      if (!e.shiftKey) st.set({ selected: [], editingText: null });
      return;
    }
    if (!st.selected.includes(hit.id)) st.set({ selected: e.shiftKey ? [...st.selected, hit.id] : [hit.id] });
    const ids = st.selected.includes(hit.id) ? st.selected : [hit.id];
    const starts = ids.map((id) => {
      const l = comp.layers.find((k) => k.id === id)!;
      return { id, pos: valueAt(l.transform.position, t), anchor: valueAt(l.transform.anchor, t), rot: valueAt(l.transform.rotation, t)[0] };
    });
    try { el.setPointerCapture(e.pointerId); } catch {}
    st.beginGesture();
    const move = (ev: PointerEvent) => {
      const [x1, y1] = toLocal(ev.clientX, ev.clientY);
      st.updateGesture((c) => ({
        ...c,
        layers: c.layers.map((l) => {
          const s0 = starts.find((s) => s.id === l.id);
          if (!s0 || l.locked) return l;
          if (tool === "rotate") {
            const a0 = Math.atan2(y - s0.pos[1], x - s0.pos[0]);
            const a1 = Math.atan2(y1 - s0.pos[1], x1 - s0.pos[0]);
            return { ...l, transform: { ...l.transform, rotation: setAt(l.transform.rotation, [Math.round(s0.rot + ((a1 - a0) * 180) / Math.PI)], t, c.fps) } };
          }
          if (tool === "anchor") {
            const dx = x1 - x;
            const dy = y1 - y;
            return { ...l, transform: { ...l.transform, anchor: setAt(l.transform.anchor, [s0.anchor[0] + dx, s0.anchor[1] + dy, ...s0.anchor.slice(2)], t, c.fps), position: setAt(l.transform.position, [s0.pos[0] + dx, s0.pos[1] + dy, ...s0.pos.slice(2)], t, c.fps) } };
          }
          const [nx, ny] = snapP(s0.pos[0] + x1 - x, s0.pos[1] + y1 - y);
          return { ...l, transform: { ...l.transform, position: setAt(l.transform.position, [Math.round(nx), Math.round(ny), ...s0.pos.slice(2)], t, c.fps) } };
        }),
      }));
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      st.endGesture(tool === "rotate" ? "Rotazione" : tool === "anchor" ? "Punto di ancoraggio" : "Posizione");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 px-3 pb-1">
        {st.openComps.map((id) => (
          <button key={id} type="button" onClick={() => st.openComp(id)} className={clsx("rounded-[4px] px-2.5 py-1 text-[12px]", id === comp.id ? "bg-[#3a3a3a] text-white" : "text-[#9a9a9a] hover:bg-white/5")}>
            {st.project.comps[id]?.name}
          </button>
        ))}
      </div>
      <div className="relative min-h-0 flex-1 bg-[#1b1b1b]" onDoubleClick={() => sel[0]?.type === "text" && st.set({ editingText: sel[0].id })}>
        <Stage
          w={comp.width}
          h={comp.height}
          zoom={st.viewerZoom}
          bg={checker ? "repeating-conic-gradient(#3a3a3a 0 25%, #2a2a2a 0 50%) 0 0/40px 40px" : comp.bg}
          className={clsx(st.tool === "hand" && "cursor-grab", st.tool === "zoom" && "cursor-zoom-in", ["rect", "rrect", "ellipse", "polygon", "star", "pen"].includes(st.tool) && "cursor-crosshair", (st.tool === "text" || st.tool === "vtext") && "cursor-text")}
          onPointerDown={onDown}
          overlay={(scale) => {
            scaleRef.current = scale;
            return (
              <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${comp.width} ${comp.height}`} preserveAspectRatio="none">
                {grid &&
                  [1, 2].map((i) => (
                    <g key={i} stroke="#ffffff55" strokeWidth={1 / scale}>
                      <line x1={(comp.width * i) / 3} x2={(comp.width * i) / 3} y1={0} y2={comp.height} />
                      <line y1={(comp.height * i) / 3} y2={(comp.height * i) / 3} x1={0} x2={comp.width} />
                    </g>
                  ))}
                {!st.playing && sel.map((l) => <Handles key={l.id} l={l} comp={comp} t={t} scale={scale} />)}
                {st.maskDraft &&
                  (() => {
                    const l = comp.layers.find((k) => k.id === st.maskDraft!.layer);
                    if (!l) return null;
                    const tf = layerTransform(l, t, comp, 1);
                    const p = st.maskDraft.pts;
                    return (
                      <g transform={`translate(${tf.pos[0]} ${tf.pos[1]}) rotate(${tf.rot}) scale(${tf.scale[0] / 100} ${tf.scale[1] / 100}) translate(${-tf.anchor[0]} ${-tf.anchor[1]})`}>
                        <polyline points={Array.from({ length: p.length / 2 }, (_, i) => `${p[2 * i]},${p[2 * i + 1]}`).join(" ")} fill="none" stroke="#f0d14a" strokeWidth={1.5 / scale} />
                        {Array.from({ length: p.length / 2 }, (_, i) => (
                          <rect key={i} x={p[2 * i] - 4 / scale} y={p[2 * i + 1] - 4 / scale} width={8 / scale} height={8 / scale} fill={i === 0 ? "#f0d14a" : "#1b1b1b"} stroke="#f0d14a" strokeWidth={1 / scale} />
                        ))}
                      </g>
                    );
                  })()}
                {draft && <rect x={Math.min(draft.x0, draft.x1)} y={Math.min(draft.y0, draft.y1)} width={Math.abs(draft.x1 - draft.x0)} height={Math.abs(draft.y1 - draft.y0)} rx={st.tool === "ellipse" ? 9999 : 0} fill="#3d9cf033" stroke="#3d9cf0" strokeWidth={1.5 / scale} />}
              </svg>
            );
          }}
        >
          <CompFrame comp={comp} project={st.project} t={t} playing={st.playing} hideLayers={editLayer ? new Set([editLayer.id]) : undefined} />
          {editLayer && (
            <div className="absolute left-0 top-0" style={{ ...layerTransform(editLayer, t, comp, 1).css }}>
              <div className="absolute left-0 top-0" style={{ transform: "translate(-50%, -50%)" }}>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  ref={(n) => {
                    if (n && document.activeElement !== n) {
                      n.focus();
                      document.getSelection()?.selectAllChildren(n);
                    }
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey && e.currentTarget.dataset.enter)) (e.target as HTMLElement).blur();
                  }}
                  onBlur={(e) => {
                    const v = e.currentTarget.innerText;
                    A.updateLayer(editLayer.id, (l) => ({ ...l, text: v, name: v.slice(0, 30) || l.name }), "Modifica testo");
                    st.set({ editingText: null });
                  }}
                  className="outline outline-1 outline-[#3d9cf0]"
                  style={{ ...textCss(editLayer.textStyle!), minWidth: 20 }}
                >
                  {editLayer.text}
                </div>
              </div>
            </div>
          )}
        </Stage>
        <CompAudio comp={comp} project={st.project} t={t} playing={st.playing} />
      </div>
      <div className="flex h-[30px] shrink-0 items-center gap-2 px-3 text-[12px] text-[#bdbdbd]">
        <span className="relative inline-flex items-center">
          <select
            value={String(st.viewerZoom)}
            onChange={(e) => st.set({ viewerZoom: e.target.value === "fit" ? "fit" : Number(e.target.value) })}
            className="h-6 appearance-none bg-transparent pr-5 text-[#3d9cf0] outline-none"
          >
            {["fit", 12.5, 25, 33.3, 50, 66.7, 100, 200, 400].map((z) => (
              <option key={z} value={z}>
                {z === "fit" ? "Adatta" : `${z} %`}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-0" />
        </span>
        <span className="relative inline-flex items-center rounded border border-[#3a3a3a] px-2">
          <select value={res} onChange={(e) => setRes(e.target.value)} className="h-5 appearance-none bg-transparent pr-5 outline-none">
            {["Piena", "Metà", "Terzo", "Quarto", "Auto"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-1" />
        </span>
        <button type="button" title="Attiva/disattiva griglia di trasparenza" onClick={() => setChecker(!checker)} className={clsx("grid h-6 w-6 place-items-center rounded", checker && "bg-[#3a3a3a] text-white")}>
          <ImageIcon size={13} />
        </button>
        <button type="button" title="Griglia e guide" onClick={() => setGrid(!grid)} className={clsx("grid h-6 w-6 place-items-center rounded", grid && "bg-[#3a3a3a] text-white")}>
          <Grid3x3 size={13} />
        </button>
        <span className="text-[#3d9cf0]">+0,0</span>
        <button type="button" title="Acquisisci istantanea" onClick={() => st.notify("Istantanea acquisita")} className="grid h-6 w-6 place-items-center rounded hover:bg-white/10">
          <Camera size={13} />
        </button>
        <span className="ml-2 rounded border border-[#3a3a3a] px-3 py-0.5 font-mono">{aeTime(t, comp.fps)}</span>
      </div>
    </div>
  );
}

function newTf(x: number, y: number) {
  return { anchor: prop(0, 0), position: prop(Math.round(x), Math.round(y)), scale: prop(100, 100), rotation: prop(0), rotX: prop(0), rotY: prop(0), opacity: prop(100) };
}

function hitTest(comp: Comp, t: number, x: number, y: number): Layer | undefined {
  for (const l of comp.layers) {
    if (!l.visible || l.locked || t < l.inPoint || t >= l.outPoint) continue;
    const tf = layerTransform(l, t, comp, 1);
    const r = (-tf.rot * Math.PI) / 180;
    const dx = x - tf.pos[0];
    const dy = y - tf.pos[1];
    const lx = (dx * Math.cos(r) - dy * Math.sin(r)) / ((tf.scale[0] || 1) / 100) + tf.anchor[0];
    const ly = (dx * Math.sin(r) + dy * Math.cos(r)) / ((tf.scale[1] || 1) / 100) + tf.anchor[1];
    let [x0, y0, x1, y1] = [0, 0, l.w, l.h];
    if (l.type === "text") {
      const s = l.textStyle!;
      const w = (l.text?.length ?? 4) * s.size * 0.55;
      [x0, y0, x1, y1] = [-w / 2, -s.size * 0.6, w / 2, s.size * 0.6];
    }
    if (l.type === "shape") {
      const [w, h] = valueAt(l.shape!.size, t);
      [x0, y0, x1, y1] = [-w / 2, -h / 2, w / 2, h / 2];
    }
    if (lx >= x0 && lx <= x1 && ly >= y0 && ly <= y1) return l;
  }
  return undefined;
}

function Handles({ l, comp, t, scale }: { l: Layer; comp: Comp; t: number; scale: number }) {
  const tf = layerTransform(l, t, comp, 1);
  let [x0, y0, x1, y1] = [0, 0, l.w, l.h];
  if (l.type === "text") {
    const s = l.textStyle!;
    const w = (l.text?.length ?? 4) * s.size * 0.55;
    [x0, y0, x1, y1] = [-w / 2, -s.size * 0.6, w / 2, s.size * 0.6];
  }
  if (l.type === "shape") {
    const [w, h] = valueAt(l.shape!.size, t);
    [x0, y0, x1, y1] = [-w / 2, -h / 2, w / 2, h / 2];
  }
  const k = 1 / scale;
  const sx = (tf.scale[0] || 1) / 100;
  const sy = (tf.scale[1] || 1) / 100;
  const pts = l.transform.position.keys;
  const path: string[] = [];
  if (pts && pts.length > 1) for (let x = pts[0].t; x <= pts[pts.length - 1].t + 1e-6; x += 1 / comp.fps) {
    const v = valueAt(l.transform.position, x);
    path.push(`${v[0]},${v[1]}`);
  }
  return (
    <g>
      {path.length > 1 && (
        <>
          <polyline points={path.join(" ")} fill="none" stroke="#f0d14a" strokeWidth={1.2 * k} strokeDasharray={`${3 * k} ${3 * k}`} />
          {pts!.map((p) => (
            <rect key={p.id} x={p.v[0] - 4 * k} y={p.v[1] - 4 * k} width={8 * k} height={8 * k} fill="none" stroke="#f0d14a" strokeWidth={1.2 * k} />
          ))}
        </>
      )}
      <g transform={`translate(${tf.pos[0]} ${tf.pos[1]}) rotate(${tf.rot}) scale(${sx} ${sy}) translate(${-tf.anchor[0]} ${-tf.anchor[1]})`}>
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke={AE_HANDLE} strokeWidth={1.2 * k / Math.max(sx, 0.01)} vectorEffect="non-scaling-stroke" />
        {[
          [x0, y0],
          [x1, y0],
          [x0, y1],
          [x1, y1],
          [(x0 + x1) / 2, y0],
          [(x0 + x1) / 2, y1],
          [x0, (y0 + y1) / 2],
          [x1, (y0 + y1) / 2],
        ].map(([hx, hy], i) => (
          <rect key={i} x={hx - (4 * k) / sx} y={hy - (4 * k) / sy} width={(8 * k) / sx} height={(8 * k) / sy} fill="#1b1b1b" stroke={AE_HANDLE} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        {l.masks.map((m) =>
          m.kind === "poly" ? (
            <polygon key={m.id} points={Array.from({ length: m.path.length / 2 }, (_, i) => `${m.path[2 * i]},${m.path[2 * i + 1]}`).join(" ")} fill="none" stroke="#f0d14a" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ) : m.kind === "rect" ? (
            <rect key={m.id} x={m.path[0]} y={m.path[1]} width={m.path[2]} height={m.path[3]} fill="none" stroke="#f0d14a" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ) : (
            <ellipse key={m.id} cx={m.path[0] + m.path[2] / 2} cy={m.path[1] + m.path[3] / 2} rx={m.path[2] / 2} ry={m.path[3] / 2} fill="none" stroke="#f0d14a" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ),
        )}
      </g>
      <g transform={`translate(${tf.pos[0]} ${tf.pos[1]})`}>
        <circle r={6 * k} fill="none" stroke="#fff" strokeWidth={1.2 * k} />
        <path d={`M${-11 * k} 0H${11 * k}M0 ${-11 * k}V${11 * k}`} stroke="#fff" strokeWidth={1.2 * k} />
      </g>
    </g>
  );
}

const AE_HANDLE = "#e8d43a";
