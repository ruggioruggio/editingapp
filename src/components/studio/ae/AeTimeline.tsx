"use client";

import { useRef } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, LineChart, Square, Timer, Type } from "lucide-react";
import { Scrubby } from "@/components/premiere/controls";
import {
  PROP_KEYS,
  PROP_LABEL,
  addKey,
  setProp,
  toggleStopwatch,
  updateKeys,
  useAfterEffects,
  valueAt,
  type AeLayer,
  type Interp,
  type PropKey,
} from "@/lib/studio/afterEffects";
import { timecode } from "../chrome";

const LEFT = 400;
const ROW = 26;
const PROW = 24;

const UNITS: Record<PropKey, { suffix: string; step: number; decimals: number }> = {
  anchor: { suffix: "", step: 1, decimals: 1 },
  position: { suffix: "", step: 1, decimals: 1 },
  scale: { suffix: "%", step: 0.5, decimals: 1 },
  rotation: { suffix: "°", step: 0.5, decimals: 1 },
  opacity: { suffix: "%", step: 0.5, decimals: 0 },
};

/** Il rombo cambia forma come in After Effects: lineare, Easy Ease (clessidra), tenuta (quadrato). */
function KeyGlyph({ interp, selected }: { interp: Interp; selected: boolean }) {
  const fill = selected ? "#5aa9ff" : "#c8c8c8";
  if (interp === "ease") return <path d="M-5 -6 L5 -6 L0 0 L5 6 L-5 6 L0 0 Z" fill={fill} stroke="#111" strokeWidth=".8" />;
  if (interp === "hold") return <rect x="-5" y="-5" width="10" height="10" fill={fill} stroke="#111" strokeWidth=".8" />;
  return <path d="M0 -6 L6 0 L0 6 L-6 0 Z" fill={fill} stroke="#111" strokeWidth=".8" />;
}

export function AeTimeline() {
  const st = useAfterEffects();
  const { comp, time, pxPerSec: pps, selected, selectedKeys, open, graph } = st;
  const scroller = useRef<HTMLDivElement>(null);
  const width = comp.duration * pps + 40;
  const frame = 1 / comp.fps;
  const snapT = (t: number) => Math.max(0, Math.min(comp.duration, Math.round(t / frame) * frame));

  const xToTime = (clientX: number) => {
    const el = scroller.current!;
    return (clientX - el.getBoundingClientRect().left - LEFT + el.scrollLeft) / pps;
  };

  const scrub = (e: React.PointerEvent) => st.set({ time: snapT(xToTime(e.clientX)), playing: false });

  const dragLayerBar = (e: React.PointerEvent<HTMLDivElement>, l: AeLayer, mode: "move" | "in" | "out") => {
    e.stopPropagation();
    st.set({ selected: [l.id] });
    const x0 = e.clientX;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    st.beginGesture();
    const move = (ev: PointerEvent) => {
      const dt = Math.round((ev.clientX - x0) / pps / frame) * frame;
      st.updateGesture((base) => ({
        ...base,
        layers: base.layers.map((k) => {
          if (k.id !== l.id) return k;
          if (mode === "in") return { ...k, inPoint: Math.max(0, Math.min(k.outPoint - frame, l.inPoint + dt)) };
          if (mode === "out") return { ...k, outPoint: Math.min(base.duration, Math.max(k.inPoint + frame, l.outPoint + dt)) };
          // spostare il livello sposta anche i suoi keyframe
          const props = { ...k.props };
          for (const pk of PROP_KEYS) {
            const p = l.props[pk];
            if (p.keys) props[pk] = { ...p, keys: p.keys.map((kf) => ({ ...kf, t: kf.t + dt })) };
          }
          return { ...k, inPoint: l.inPoint + dt, outPoint: l.outPoint + dt, props };
        }),
      }));
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      st.endGesture();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  const dragKey = (e: React.PointerEvent, l: AeLayer, pk: PropKey, id: string, t0: number) => {
    e.stopPropagation();
    const keys = e.shiftKey ? [...new Set([...selectedKeys, id])] : selectedKeys.includes(id) ? selectedKeys : [id];
    st.set({ selectedKeys: keys, selected: [l.id], time: t0 });
    const x0 = e.clientX;
    const el = e.currentTarget as Element;
    el.setPointerCapture(e.pointerId);
    st.beginGesture();
    const ids = new Set(keys);
    const move = (ev: PointerEvent) => {
      const dt = Math.round((ev.clientX - x0) / pps / frame) * frame;
      st.updateGesture((base) => updateKeys(base, ids, (k) => ({ ...k, t: snapTimeFor(base, k.id, dt) })));
      st.set({ time: snapT(t0 + dt) });
    };
    // il tempo nuovo parte da quello del keyframe nella composizione di partenza
    const snapTimeFor = (base: typeof comp, kid: string, dt: number) => {
      for (const ly of base.layers) for (const p of PROP_KEYS) for (const k of ly.props[p].keys ?? []) if (k.id === kid) return snapT(k.t + dt);
      return 0;
    };
    const up = () => {
      el.removeEventListener("pointermove", move as EventListener);
      el.removeEventListener("pointerup", up);
      st.endGesture();
    };
    el.addEventListener("pointermove", move as EventListener);
    el.addEventListener("pointerup", up);
  };

  const step = pps >= 150 ? 0.5 : pps >= 60 ? 1 : 2;
  const ticks = Array.from({ length: Math.floor(comp.duration / step) + 1 }, (_, i) => i * step);

  const rows: React.ReactNode[] = [];
  comp.layers.forEach((l, i) => {
    const isSel = selected.includes(l.id);
    const shown = open[l.id];
    rows.push(
      <div key={l.id} className={clsx("flex border-b border-[#1a1a1a]", isSel ? "bg-[#3a3a4a]" : "bg-[#262626]")} style={{ height: ROW }}>
        <div
          className="sticky left-0 z-10 flex shrink-0 items-center gap-1.5 border-r border-black px-1 text-[12px]"
          style={{ width: LEFT, background: isSel ? "#3a3a4a" : "#262626" }}
          onPointerDown={(e) => st.set({ selected: e.shiftKey ? [...new Set([...selected, l.id])] : [l.id] })}
        >
          <button
            type="button"
            title="Video (visibilità)"
            onClick={(e) => {
              e.stopPropagation();
              st.commit({ ...comp, layers: comp.layers.map((k) => (k.id === l.id ? { ...k, visible: !k.visible } : k)) });
            }}
            className="text-[#9a9a9a] hover:text-white"
          >
            {l.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <span className="h-3 w-3 rounded-sm" style={{ background: l.label }} />
          <span className="w-4 text-right text-[#8f8f8f]">{i + 1}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const o = { ...open };
              if (o[l.id]) delete o[l.id];
              else o[l.id] = [...PROP_KEYS];
              st.set({ open: o });
            }}
            className="text-[#9a9a9a]"
            aria-label="Mostra proprietà"
          >
            {shown ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {l.type === "text" ? <Type size={13} className="text-[#cfcfcf]" /> : <Square size={12} className="text-[#cfcfcf]" style={{ fill: l.type === "solid" ? l.color : "transparent" }} />}
          <span className="truncate text-[#e0e0e0]">{l.name}</span>
        </div>
        <div className="relative shrink-0" style={{ width }}>
          <div
            onPointerDown={(e) => dragLayerBar(e, l, "move")}
            className="absolute top-1 cursor-grab rounded-[2px] border border-black/50"
            style={{ left: l.inPoint * pps, width: (l.outPoint - l.inPoint) * pps, height: ROW - 8, background: l.label, opacity: isSel ? 0.75 : 0.45 }}
          >
            <div onPointerDown={(e) => dragLayerBar(e, l, "in")} className="absolute inset-y-0 left-0 w-1.5 cursor-ew-resize" />
            <div onPointerDown={(e) => dragLayerBar(e, l, "out")} className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize" />
          </div>
          {!shown &&
            [...new Set(PROP_KEYS.flatMap((pk) => l.props[pk].keys?.map((k) => k.t) ?? []))].map((t) => (
              <span key={t} className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#c8c8c8]/70" style={{ left: t * pps }} />
            ))}
        </div>
      </div>,
    );
    if (!shown) return;
    for (const pk of shown) {
      const p = l.props[pk];
      const v = valueAt(p, time);
      const keys = p.keys ?? [];
      const onKey = keys.find((k) => Math.abs(k.t - time) < frame / 2);
      const prev = [...keys].reverse().find((k) => k.t < time - frame / 2);
      const next = keys.find((k) => k.t > time + frame / 2);
      const u = UNITS[pk];
      const isGraph = graph?.layer === l.id && graph.prop === pk;
      rows.push(
        <div key={l.id + pk} className="flex border-b border-[#1d1d1d] bg-[#232323]" style={{ height: PROW }}>
          <div className="sticky left-0 z-10 flex shrink-0 items-center gap-1.5 border-r border-black bg-[#232323] pl-12 pr-1 text-[12px]" style={{ width: LEFT }}>
            <button
              type="button"
              title="Cronometro: attiva/disattiva i keyframe"
              onClick={() => st.commit(toggleStopwatch(comp, l.id, pk, time))}
              className={clsx("shrink-0", p.keys ? "text-[#2d8ceb]" : "text-[#7a7a7a] hover:text-white")}
            >
              <Timer size={14} />
            </button>
            <button
              type="button"
              // con l'editor grafico aperto, il nome sceglie quale curva mostrare
              onClick={() => st.set({ ...(graph ? { graph: { layer: l.id, prop: pk } } : {}), selected: [l.id] })}
              className={clsx("w-[118px] shrink-0 truncate text-left", isGraph ? "text-[#5aa9ff]" : "text-[#cfcfcf]")}
            >
              {PROP_LABEL[pk]}
            </button>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              {v.map((x, d) => (
                <Scrubby
                  key={d}
                  value={x}
                  step={u.step}
                  decimals={u.decimals}
                  suffix={u.suffix}
                  min={pk === "opacity" ? 0 : -100000}
                  max={pk === "opacity" ? 100 : 100000}
                  onChange={(nv) => {
                    const s = useAfterEffects.getState();
                    const cur = valueAt(s.comp.layers.find((k) => k.id === l.id)!.props[pk], s.time);
                    const next = [...cur];
                    next[d] = nv;
                    if (pk === "scale" && d === 0 && cur[0] === cur[1]) next[1] = nv; // proporzioni vincolate
                    s.commit(setProp(s.comp, l.id, pk, next, s.time), `${l.id}${pk}${d}`);
                  }}
                />
              ))}
            </span>
            {p.keys && (
              <span className="flex shrink-0 items-center text-[#9a9a9a]">
                <button type="button" title="Keyframe precedente (J)" disabled={!prev} onClick={() => prev && st.set({ time: prev.t })} className="disabled:opacity-30">
                  <ChevronLeft size={13} />
                </button>
                <button type="button" title="Aggiungi o rimuovi keyframe" onClick={() => st.commit(onKey ? updateKeys(comp, new Set([onKey.id]), () => null) : addKey(comp, l.id, pk, time))}>
                  <svg width="12" height="12" viewBox="-7 -7 14 14">
                    <path d="M0 -6 L6 0 L0 6 L-6 0 Z" fill={onKey ? "#2d8ceb" : "none"} stroke="#bdbdbd" strokeWidth="1.2" />
                  </svg>
                </button>
                <button type="button" title="Keyframe successivo (K)" disabled={!next} onClick={() => next && st.set({ time: next.t })} className="disabled:opacity-30">
                  <ChevronRight size={13} />
                </button>
              </span>
            )}
          </div>
          <div className="relative shrink-0" style={{ width }}>
            {!graph &&
              keys.map((k) => (
                <svg
                  key={k.id}
                  width="14"
                  height="14"
                  viewBox="-7 -7 14 14"
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize"
                  style={{ left: k.t * pps }}
                  onPointerDown={(e) => dragKey(e, l, pk, k.id, k.t)}
                >
                  <KeyGlyph interp={k.interp} selected={selectedKeys.includes(k.id)} />
                </svg>
              ))}
          </div>
        </div>,
      );
    }
  });

  const contentH = 26 + comp.layers.length * ROW + Object.entries(open).reduce((a, [id, ks]) => a + (comp.layers.some((l) => l.id === id) ? ks.length * PROW : 0), 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-8 shrink-0 items-center gap-3 border-b border-black px-2 text-[12px]">
        <span className="font-mono text-[16px] text-[#2d8ceb]">{timecode(time, comp.fps)}</span>
        <span className="text-[11px] text-[#7a7a7a]">{Math.round(time * comp.fps)} ({comp.fps} fps)</span>
        <button
          type="button"
          title="Editor grafico"
          onClick={() => st.set({ graph: graph ? null : selected[0] ? { layer: selected[0], prop: "position" } : comp.layers[0] ? { layer: comp.layers[0].id, prop: "position" } : null })}
          className={clsx("ml-auto flex items-center gap-1 rounded px-2 py-1", graph ? "bg-[#2680eb] text-white" : "text-[#bdbdbd] hover:bg-white/10")}
        >
          <LineChart size={14} /> Editor grafico
        </button>
        <input type="range" min={40} max={400} value={pps} onChange={(e) => st.set({ pxPerSec: Number(e.target.value) })} className="w-24 accent-[#9a9a9a]" aria-label="Zoom" />
      </div>
      <div ref={scroller} className="relative min-h-0 flex-1 overflow-auto bg-[#1d1d1d]">
        <div className="relative" style={{ width: LEFT + width, minHeight: contentH }}>
          {/* righello */}
          <div className="sticky top-0 z-20 flex border-b border-black bg-[#1f1f1f]" style={{ height: 26 }}>
            <div className="sticky left-0 z-10 flex shrink-0 items-center gap-4 border-r border-black bg-[#232323] px-2 text-[11px] text-[#8f8f8f]" style={{ width: LEFT }}>
              <span>#</span>
              <span>Nome livello</span>
            </div>
            <div
              className="relative shrink-0 cursor-pointer"
              style={{ width }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                scrub(e);
              }}
              onPointerMove={(e) => e.buttons & 1 && scrub(e)}
            >
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#6a6a8a]/60" style={{ width: comp.duration * pps }} />
              {ticks.map((t) => (
                <div key={t} className="absolute top-0 h-full border-l border-[#4a4a4a]" style={{ left: t * pps }}>
                  <span className="absolute left-1 top-0.5 font-mono text-[9px] text-[#8a8a8a]">{t % 1 === 0 ? `${t}s` : ""}</span>
                </div>
              ))}
            </div>
          </div>
          {rows}
          {graph && <GraphEditor />}
          {/* indicatore del tempo corrente */}
          <div className="pointer-events-none absolute top-0 z-30" style={{ left: LEFT + time * pps, height: Math.max(contentH, 200) }}>
            <div className="absolute -left-[5px] top-[14px] h-2.5 w-2.5 rounded-b-sm bg-[#2d8ceb]" />
            <div className="absolute left-0 top-0 h-full w-px bg-[#2d8ceb]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Editor grafico: grafico del valore o della velocità per la proprietà scelta. */
function GraphEditor() {
  const st = useAfterEffects();
  const { comp, graph, pxPerSec: pps, selectedKeys } = st;
  const l = comp.layers.find((x) => x.id === graph?.layer);
  if (!graph || !l) return null;
  const p = l.props[graph.prop];
  const H = 220;
  const samples: number[][] = [];
  const speeds: number[] = [];
  const dt = 1 / comp.fps;
  for (let t = 0; t <= comp.duration + 1e-6; t += dt) {
    const v = valueAt(p, t);
    samples.push(v);
    const v2 = valueAt(p, Math.min(comp.duration, t + dt));
    speeds.push(Math.hypot(...v.map((x, d) => (v2[d] - x) / dt)));
  }
  const dims = samples[0].length;
  const all = samples.flat();
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const smax = Math.max(...speeds) || 1;
  const y = (v: number) => H - 20 - ((v - min) / span) * (H - 40);
  const ys = (v: number) => H - 20 - (v / smax) * (H - 40);
  const colors = ["#ff6b6b", "#5fd38a", "#5aa9ff"];
  const keys = p.keys ?? [];
  return (
    <div className="absolute z-10 border-t border-black bg-[#1b1b1b]" style={{ left: LEFT, top: 26, width: comp.duration * pps + 40, height: H + 30 }}>
      <div className="flex items-center gap-3 px-2 py-1 text-[11px] text-[#9a9a9a]">
        <span className="text-white">
          {l.name} › {PROP_LABEL[graph.prop]}
        </span>
        <span className="text-[#ffc93c]">— velocità</span>
        {dims > 1 && <span>X <b className="text-[#ff6b6b]">—</b> Y <b className="text-[#5fd38a]">—</b></span>}
        {!keys.length && <span>Attiva il cronometro per animare questa proprietà.</span>}
      </div>
      <svg width={comp.duration * pps + 40} height={H} className="block">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2="100%" y1={H * f} y2={H * f} stroke="#2a2a2a" />
        ))}
        <polyline points={speeds.map((s, i) => `${i * dt * pps},${ys(s)}`).join(" ")} fill="none" stroke="#ffc93c" strokeWidth="1.5" strokeOpacity=".8" />
        {Array.from({ length: dims }, (_, d) => (
          <polyline key={d} points={samples.map((v, i) => `${i * dt * pps},${y(v[d])}`).join(" ")} fill="none" stroke={colors[d]} strokeWidth="2" />
        ))}
        {keys.map((k) =>
          k.v.map((v, d) => (
            <rect
              key={k.id + d}
              x={k.t * pps - 4}
              y={y(v) - 4}
              width="8"
              height="8"
              fill={selectedKeys.includes(k.id) ? "#5aa9ff" : "#fff"}
              stroke="#000"
              className="cursor-pointer"
              onPointerDown={() => st.set({ selectedKeys: [k.id], time: k.t })}
            />
          )),
        )}
      </svg>
      <p className="px-2 text-[10px] text-[#7a7a7a]">
        Seleziona i keyframe e premi F9 (Easy Ease): la curva gialla della velocità parte e arriva piano, come una vera animazione.
      </p>
    </div>
  );
}
