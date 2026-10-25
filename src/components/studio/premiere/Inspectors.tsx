"use client";

import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { AlignCenter, AlignLeft, AlignRight, Bold, ChevronDown, ChevronRight, Ellipsis, Italic, RotateCcw, Square, Circle, Type, Underline, Video, AudioLines, Trash2 } from "lucide-react";
import { keyKind, mapKeys, setAt, toggleKeyAt, toggleStopwatch, valueAt, withKind, type Key, type KeyKind, type Prop } from "@/lib/studio/anim";
import { BLEND_MODES, getEffect, hexToRgb, rgbToHex, type EffectInstance, type ParamDef } from "@/lib/studio/effects";
import { FONTS, type TextStyle } from "@/lib/studio/text";
import { audioTracks, clipAt, clipDur, isVideoTrack, newGraphicLayer, playheadOf, seqOf, trackLabel, usePremiere, type Clip, type GraphicLayer, type MenuItemLike, type Sequence } from "@/lib/studio/premiere";
import { fmtSize } from "@/lib/studio/media";
import { Scrub, field, timecode } from "../chrome";
import * as A from "./actions";

// Pannelli di ispezione: Controlli effetti (con mini timeline dei keyframe),
// Proprietà, Grafica essenziale, Mixer clip audio e Metadati.

const KIND_LABEL: [KeyKind, string][] = [
  ["linear", "Lineare"],
  ["ease", "Bézier"],
  ["easeIn", "Ease in"],
  ["easeOut", "Ease out"],
  ["hold", "Tenuta"],
];

export function KeyGlyph({ k, selected, size = 11 }: { k: Key; selected: boolean; size?: number }) {
  const kind = keyKind(k);
  const fill = selected ? "#3d9cf0" : "#d0d0d0";
  const s = size / 2;
  return (
    <svg width={size} height={size} viewBox={`${-s} ${-s} ${size} ${size}`} className="overflow-visible">
      {kind === "hold" ? (
        <path d={`M${-s * 0.8} ${-s * 0.8}h${s * 1.6}v${s * 1.6}h${-s * 1.6}z`} fill={fill} />
      ) : kind === "ease" ? (
        <path d={`M${-s * 0.8} ${-s}L${s * 0.8} ${-s}L0 0L${s * 0.8} ${s}L${-s * 0.8} ${s}L0 0Z`} fill={fill} />
      ) : kind === "easeIn" ? (
        <path d={`M0 ${-s}L${s} 0L0 ${s}L${-s * 0.8} ${s}L0 0L${-s * 0.8} ${-s}Z`} fill={fill} />
      ) : kind === "easeOut" ? (
        <path d={`M0 ${-s}L${-s} 0L0 ${s}L${s * 0.8} ${s}L0 0L${s * 0.8} ${-s}Z`} fill={fill} />
      ) : (
        <path d={`M0 ${-s}L${s} 0L0 ${s}L${-s} 0Z`} fill={fill} />
      )}
    </svg>
  );
}

const Stopwatch = ({ on }: { on: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={on ? "#3d9cf0" : "#9a9a9a"} strokeWidth="1.2">
    <circle cx="7" cy="8" r="5" />
    <path d="M7 8V5M5.5 1.5h3M7 1.5V3" />
    {on && <circle cx="7" cy="8" r="2" fill="#3d9cf0" />}
  </svg>
);

type Editor = {
  lt: number;
  fps: number;
  dur: number;
  pps: number;
  selKeys: string[];
  setSelKeys: (ids: string[]) => void;
  go: (t: number) => void;
};

/** Riga di una proprietà animabile: cronometro, nome, valori, navigatore e keyframe nella mini timeline. */
function PropRow({
  label,
  p,
  onChange,
  ed,
  dims = 1,
  step = 1,
  decimals = 1,
  suffix = "",
  min,
  max,
  disabled,
  animatable = true,
  indent = 2,
  input,
}: {
  label: string;
  p: Prop;
  onChange: (p: Prop, key?: string) => void;
  ed: Editor;
  dims?: number;
  step?: number;
  decimals?: number;
  suffix?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  animatable?: boolean;
  indent?: number;
  input?: ReactNode;
}) {
  const st = usePremiere();
  const v = valueAt(p, ed.lt);
  const keys = p.keys ?? [];
  const onKey = keys.find((k) => Math.abs(k.t - ed.lt) < 0.5 / ed.fps);
  const prev = [...keys].reverse().find((k) => k.t < ed.lt - 0.5 / ed.fps);
  const next = keys.find((k) => k.t > ed.lt + 0.5 / ed.fps);
  const keyMenu = (e: React.MouseEvent, k: Key) => {
    e.preventDefault();
    e.stopPropagation();
    const ids = ed.selKeys.includes(k.id) ? ed.selKeys : [k.id];
    st.set({
      menu: {
        x: e.clientX,
        y: e.clientY,
        items: [
          ...KIND_LABEL.map(([kind, name]) => ({ label: name, checked: keyKind(k) === kind, action: () => onChange(mapKeys(p, (kk) => (ids.includes(kk.id) ? withKind(kk, kind) : kk))) })),
          "-",
          { label: "Elimina", action: () => onChange(mapKeys(p, (kk) => (ids.includes(kk.id) ? null : kk))) },
        ] as MenuItemLike[],
      },
    });
  };
  return (
    <div className="flex h-[24px] items-center">
      <div className="flex h-full w-[58%] shrink-0 items-center gap-1.5 pr-2 text-[12px]" style={{ paddingLeft: indent * 10 }}>
        {animatable ? (
          <button type="button" title="Attiva/disattiva animazione" onClick={() => onChange(toggleStopwatch(p, ed.lt, ed.fps))} className="shrink-0">
            <Stopwatch on={!!p.keys} />
          </button>
        ) : (
          <span className="w-[14px] shrink-0" />
        )}
        <span className={clsx("w-[44%] shrink-0 truncate", disabled ? "text-[#6a6a6a]" : "text-[#d0d0d0]")}>{label}</span>
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          {input ??
            v.slice(0, dims).map((x, d) => (
              <Scrub
                key={d}
                value={x}
                step={step}
                decimals={decimals}
                suffix={suffix}
                min={min}
                max={max}
                disabled={disabled}
                onChange={(nv) => {
                  const cur = valueAt(p, ed.lt);
                  const n = [...cur];
                  n[d] = nv;
                  onChange(setAt(p, n, ed.lt, ed.fps), label + d);
                }}
              />
            ))}
        </span>
        {p.keys && (
          <span className="flex shrink-0 items-center text-[#bdbdbd]">
            <button type="button" title="Vai al fotogramma chiave precedente" disabled={!prev} onClick={() => prev && ed.go(prev.t)} className="px-0.5 text-[10px] disabled:opacity-30">
              ◀
            </button>
            <button type="button" title="Aggiungi/rimuovi fotogramma chiave" onClick={() => onChange(toggleKeyAt(p, ed.lt, ed.fps))}>
              <svg width="11" height="11" viewBox="-6 -6 12 12">
                <path d="M0 -5L5 0L0 5L-5 0Z" fill={onKey ? "#3d9cf0" : "none"} stroke="#d0d0d0" />
              </svg>
            </button>
            <button type="button" title="Vai al fotogramma chiave successivo" disabled={!next} onClick={() => next && ed.go(next.t)} className="px-0.5 text-[10px] disabled:opacity-30">
              ▶
            </button>
          </span>
        )}
      </div>
      <div className="relative h-full flex-1 border-l border-[#141414]">
        {keys.map((k) => (
          <span
            key={k.id}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: k.t * ed.pps }}
            onContextMenu={(e) => keyMenu(e, k)}
            onPointerDown={(e) => {
              e.stopPropagation();
              const sel = e.shiftKey ? [...new Set([...ed.selKeys, k.id])] : ed.selKeys.includes(k.id) ? ed.selKeys : [k.id];
              ed.setSelKeys(sel);
              const el = e.currentTarget;
              try { el.setPointerCapture(e.pointerId); } catch {}
              const x0 = e.clientX;
              const base = p;
              const move = (ev: PointerEvent) => {
                const dt = Math.round(((ev.clientX - x0) / ed.pps) * ed.fps) / ed.fps;
                onChange(mapKeys(base, (kk) => (sel.includes(kk.id) ? { ...kk, t: Math.max(0, kk.t + dt) } : kk)), "kmove" + k.id);
              };
              const up = () => {
                el.removeEventListener("pointermove", move);
                el.removeEventListener("pointerup", up);
              };
              el.addEventListener("pointermove", move);
              el.addEventListener("pointerup", up);
            }}
          >
            <KeyGlyph k={k} selected={ed.selKeys.includes(k.id)} />
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children, open = true, fx, onToggleFx, onReset, onMenu, depth = 1 }: { title: string; children: ReactNode; open?: boolean; fx?: boolean; onToggleFx?: () => void; onReset?: () => void; onMenu?: (e: React.MouseEvent) => void; depth?: number }) {
  const [o, setO] = useState(open);
  return (
    <div>
      <div className="flex h-[24px] items-center" onContextMenu={onMenu}>
        <div className="flex w-[58%] shrink-0 items-center gap-1 pr-2 text-[12px]" style={{ paddingLeft: depth * 8 }}>
          <button type="button" onClick={() => setO(!o)} className="text-[#9a9a9a]">
            {o ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {fx !== undefined && (
            <button type="button" title="Attiva/disattiva effetto" onClick={onToggleFx} className={clsx("w-4 text-[11px] font-bold italic", fx ? "text-[#d0d0d0]" : "text-[#5a5a5a] line-through")}>
              fx
            </button>
          )}
          <span className="truncate font-semibold text-[#e0e0e0]">{title}</span>
          {onReset && (
            <button type="button" title="Ripristina effetto" onClick={onReset} className="ml-auto text-[#8a8a8a] hover:text-white">
              <RotateCcw size={11} />
            </button>
          )}
        </div>
        <div className="h-full flex-1 border-l border-[#141414]" />
      </div>
      {o && children}
    </div>
  );
}

function paramInput(def: ParamDef, p: Prop, onChange: (p: Prop, key?: string) => void, ed: Editor): ReactNode | undefined {
  const v = valueAt(p, ed.lt);
  if (def.type === "color")
    return (
      <input
        type="color"
        value={rgbToHex(v)}
        onChange={(e) => onChange(setAt(p, hexToRgb(e.target.value), ed.lt, ed.fps), def.id)}
        className="h-4 w-8 cursor-pointer rounded-sm border border-[#4a4a4a] bg-transparent p-0"
      />
    );
  if (def.type === "checkbox") return <input type="checkbox" checked={!!v[0]} onChange={(e) => onChange(setAt(p, [e.target.checked ? 1 : 0], ed.lt, ed.fps))} className="h-3.5 w-3.5 accent-[#2680eb]" />;
  if (def.type === "select")
    return (
      <select value={v[0]} onChange={(e) => onChange(setAt(p, [Number(e.target.value)], ed.lt, ed.fps))} className="h-5 max-w-full rounded-sm border border-[#3e3e3e] bg-[#151515] px-1 text-[11.5px] text-[#d0d0d0] outline-none">
        {def.options!.map((o, i) => (
          <option key={o} value={i}>
            {o}
          </option>
        ))}
      </select>
    );
  return undefined;
}

export function EffectRows({ list, onChange, ed, depth = 1 }: { list: EffectInstance[]; onChange: (list: EffectInstance[], label: string, key?: string) => void; ed: Editor; depth?: number }) {
  const st = usePremiere();
  return (
    <>
      {list.map((fx, i) => {
        const def = getEffect(fx.defId);
        if (!def) return null;
        const upd = (patch: Partial<EffectInstance>, label: string, key?: string) => onChange(list.map((x) => (x.id === fx.id ? { ...x, ...patch } : x)), label, key);
        const menu = (e: React.MouseEvent) => {
          e.preventDefault();
          st.set({
            menu: {
              x: e.clientX,
              y: e.clientY,
              items: [
                { label: "Cancella", action: () => onChange(list.filter((x) => x.id !== fx.id), "Rimuovi effetto") },
                { label: "Sposta su", disabled: i === 0, action: () => onChange(list.map((x, k) => (k === i - 1 ? fx : k === i ? list[i - 1] : x)), "Riordina effetti") },
                { label: "Sposta giù", disabled: i === list.length - 1, action: () => onChange(list.map((x, k) => (k === i + 1 ? fx : k === i ? list[i + 1] : x)), "Riordina effetti") },
              ],
            },
          });
        };
        return (
          <Section
            key={fx.id}
            title={def.name}
            fx={fx.enabled}
            depth={depth}
            onToggleFx={() => upd({ enabled: !fx.enabled }, "Attiva/disattiva effetto")}
            onReset={() => upd({ params: Object.fromEntries(def.params.map((p) => [p.id, { value: typeof p.default === "function" ? p.default(1920, 1080) : p.default, keys: null }])) }, "Ripristina effetto")}
            onMenu={menu}
          >
            {def.params.length === 0 && <div className="h-[22px] pl-10 text-[11px] text-[#7a7a7a]">(nessun parametro)</div>}
            {def.params.map((pd) => (
              <PropRow
                key={pd.id}
                label={pd.name}
                p={fx.params[pd.id]}
                ed={ed}
                dims={pd.type === "point" ? 2 : 1}
                step={pd.step ?? 1}
                decimals={pd.type === "percent" || (pd.step ?? 1) < 1 ? ((pd.step ?? 1) < 0.1 ? 2 : 1) : pd.type === "point" ? 1 : 1}
                suffix={pd.suffix ?? (pd.type === "angle" ? "°" : "")}
                min={pd.min}
                max={pd.max}
                animatable={!pd.static}
                indent={depth + 2}
                input={paramInput(pd, fx.params[pd.id], (np, key) => upd({ params: { ...fx.params, [pd.id]: np } }, pd.name, key && fx.id + key), ed)}
                onChange={(np, key) => upd({ params: { ...fx.params, [pd.id]: np } }, pd.name, key && fx.id + key)}
              />
            ))}
          </Section>
        );
      })}
    </>
  );
}

// ---- Controlli effetti ------------------------------------------------------------------------------

export function EffectControls() {
  const st = usePremiere();
  const seq = seqOf(st);
  const T = playheadOf(st);
  const [selKeys, setSelKeys] = useState<string[]>([]);
  const [tlw, setTlw] = useState(240);
  const clip = seq?.clips.find((c) => st.selection.includes(c.id) && isVideoTrack(seq, c.track)) ?? seq?.clips.find((c) => st.selection.includes(c.id));

  // Canc con il pannello attivo elimina i keyframe selezionati
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (usePremiere.getState().focus !== "effectControls" || !selKeys.length || (e.key !== "Delete" && e.key !== "Backspace")) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const s = usePremiere.getState();
      const del = (p: Prop) => mapKeys(p, (k) => (selKeys.includes(k.id) ? null : k));
      s.commitSeq(
        (q) => ({
          ...q,
          clips: q.clips.map((c) =>
            s.selection.includes(c.id)
              ? {
                  ...c,
                  motion: { ...c.motion, position: del(c.motion.position), scale: del(c.motion.scale), scaleW: del(c.motion.scaleW), rotation: del(c.motion.rotation), anchor: del(c.motion.anchor) },
                  opacity: del(c.opacity),
                  volume: del(c.volume),
                  pan: del(c.pan),
                  effects: c.effects.map((fx) => ({ ...fx, params: Object.fromEntries(Object.entries(fx.params).map(([k, v]) => [k, del(v)])) })),
                }
              : c,
          ),
        }),
        "Elimina fotogrammi chiave",
      );
      setSelKeys([]);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [selKeys]);

  if (!seq || !clip) return <div className="grid h-full place-items-center text-[12.5px] text-[#8a8a8a]">(nessuna clip selezionata)</div>;
  const m = st.project.media[clip.mediaId];
  const audio = seq.clips.find((c) => st.selection.includes(c.id) && !isVideoTrack(seq, c.track) && (c.id === clip.id || (clip.linkId && c.linkId === clip.linkId))) ?? (!isVideoTrack(seq, clip.track) ? clip : undefined);
  const video = isVideoTrack(seq, clip.track) ? clip : undefined;
  const dur = clipDur(clip);
  const ed: Editor = { lt: T - clip.start, fps: seq.fps, dur, pps: tlw / Math.max(dur, 0.1), selKeys, setSelKeys, go: (t) => st.setPlayhead(clip.start + t) };
  const upd = (id: string, fn: (c: Clip) => Clip, label: string, key?: string) => A.updateClip(id, fn, label, key && id + key);

  return (
    <div className="flex h-full flex-col text-[12px]" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
      const fx = e.dataTransfer.getData("text/x-fx");
      if (fx) A.applyEffect(fx, [clip.id, ...(audio ? [audio.id] : [])]);
    }}>
      <div className="flex h-[26px] shrink-0 items-center border-b border-[#141414]">
        <div className="flex w-[58%] shrink-0 items-center gap-2 truncate px-2 text-[#bdbdbd]">
          <span className="truncate">Sorgente • {m?.name}</span>
          <ChevronDown size={11} />
          <span className="truncate text-white">
            {seq.name} • {clip.name}
          </span>
        </div>
        <div
          className="relative h-full flex-1 overflow-hidden border-l border-[#141414]"
          ref={(el) => {
            if (el && Math.abs(el.clientWidth - tlw) > 4) setTlw(el.clientWidth);
          }}
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const at = (x: number) => st.setPlayhead(clip.start + Math.max(0, Math.min(dur, ((x - r.left) / r.width) * dur)));
            at(e.clientX);
            try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
            e.currentTarget.onpointermove = (ev) => ev.buttons & 1 && at(ev.clientX);
          }}
        >
          <div className="absolute inset-x-0 top-0 h-[12px] text-[9px] text-[#8a8a8a]">
            <span className="absolute left-1">{timecode(clip.start, seq.fps)}</span>
          </div>
          <div className="absolute inset-x-0 bottom-[2px] h-[10px] truncate rounded-sm bg-[#3a3a5a] px-1 text-[9px] leading-[10px] text-white/80">{clip.name}</div>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-[#3d9cf0]" style={{ left: `calc(58% + ${Math.max(0, Math.min(dur, T - clip.start)) * ed.pps}px)` }} />
        {video && (
          <>
            <div className="flex h-[24px] items-center px-2 text-[11px] font-semibold uppercase tracking-wide text-[#9a9a9a]">
              <Video size={12} className="mr-1.5" /> Video
            </div>
            <Section title="Movimento" fx={true} onReset={() => upd(video.id, (c) => ({ ...c, motion: { ...c.motion, position: { value: [seq.width / 2, seq.height / 2], keys: null }, scale: { value: [100], keys: null }, scaleW: { value: [100], keys: null }, rotation: { value: [0], keys: null } } }), "Ripristina Movimento")}>
              <PropRow label="Posizione" p={video.motion.position} dims={2} ed={ed} onChange={(p, k) => upd(video.id, (c) => ({ ...c, motion: { ...c.motion, position: p } }), "Posizione", k)} />
              <PropRow label={video.motion.uniform ? "Scala" : "Scala altezza"} p={video.motion.scale} ed={ed} min={0} max={10000} step={0.5} onChange={(p, k) => upd(video.id, (c) => ({ ...c, motion: { ...c.motion, scale: p } }), "Scala", k)} />
              <PropRow label="Scala larghezza" p={video.motion.scaleW} ed={ed} disabled={video.motion.uniform} min={0} max={10000} step={0.5} onChange={(p, k) => upd(video.id, (c) => ({ ...c, motion: { ...c.motion, scaleW: p } }), "Scala larghezza", k)} />
              <PropRow
                label=""
                p={video.motion.flicker}
                ed={ed}
                animatable={false}
                input={
                  <label className="flex items-center gap-1.5 text-[#d0d0d0]">
                    <input type="checkbox" checked={video.motion.uniform} onChange={(e) => upd(video.id, (c) => ({ ...c, motion: { ...c.motion, uniform: e.target.checked } }), "Scala uniforme")} className="h-3.5 w-3.5 accent-[#2680eb]" />
                    Scala uniforme
                  </label>
                }
                onChange={() => {}}
              />
              <PropRow label="Rotazione" p={video.motion.rotation} ed={ed} suffix="°" onChange={(p, k) => upd(video.id, (c) => ({ ...c, motion: { ...c.motion, rotation: p } }), "Rotazione", k)} />
              <PropRow label="Punto di ancoraggio" p={video.motion.anchor} dims={2} ed={ed} onChange={(p, k) => upd(video.id, (c) => ({ ...c, motion: { ...c.motion, anchor: p } }), "Punto di ancoraggio", k)} />
              <PropRow label="Filtro antisfarfallio" p={video.motion.flicker} ed={ed} min={0} max={1} step={0.01} decimals={2} onChange={(p, k) => upd(video.id, (c) => ({ ...c, motion: { ...c.motion, flicker: p } }), "Antisfarfallio", k)} />
            </Section>
            <Section title="Opacità" fx={true} onReset={() => upd(video.id, (c) => ({ ...c, opacity: { value: [100], keys: null }, blend: 0 }), "Ripristina Opacità")}>
              <div className="flex h-[22px] items-center gap-2 pl-[42px] text-[#9a9a9a]">
                <Circle size={11} />
                <Square size={11} />
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor">
                  <path d="M1 9L4 2l3 5 3-4" />
                </svg>
              </div>
              <PropRow label="Opacità" p={video.opacity} ed={ed} min={0} max={100} suffix=" %" onChange={(p, k) => upd(video.id, (c) => ({ ...c, opacity: p }), "Opacità", k)} />
              <PropRow
                label="Metodo fusione"
                p={video.opacity}
                ed={ed}
                animatable={false}
                onChange={() => {}}
                input={
                  <select value={video.blend} onChange={(e) => upd(video.id, (c) => ({ ...c, blend: Number(e.target.value) }), "Metodo fusione")} className="h-5 rounded-sm border border-[#3e3e3e] bg-[#151515] px-1 text-[11.5px] text-[#d0d0d0] outline-none">
                    {BLEND_MODES.map(([n], i) => (
                      <option key={n} value={i}>
                        {n}
                      </option>
                    ))}
                  </select>
                }
              />
            </Section>
            <Section title="Rimappatura temporale" open={false}>
              <PropRow label="Velocità" p={{ value: [video.speed * 100], keys: null }} ed={ed} animatable={false} suffix=" %" onChange={() => {}} input={<span className="text-[#d0d0d0]">{(video.speed * 100).toFixed(2)} %</span>} />
            </Section>
            <EffectRows list={video.effects.filter((e) => !getEffect(e.defId)?.audio)} ed={ed} onChange={(list, label, key) => upd(video.id, (c) => ({ ...c, effects: [...list, ...c.effects.filter((e) => getEffect(e.defId)?.audio)] }), label, key)} />
          </>
        )}
        {audio && (
          <>
            <div className="mt-1 flex h-[24px] items-center px-2 text-[11px] font-semibold uppercase tracking-wide text-[#9a9a9a]">
              <AudioLines size={12} className="mr-1.5" /> Audio
            </div>
            <Section title="Volume" fx={true}>
              <PropRow label="Livello" p={audio.volume} ed={{ ...ed, lt: T - audio.start }} min={-60} max={15} step={0.2} suffix=" dB" onChange={(p, k) => upd(audio.id, (c) => ({ ...c, volume: p }), "Volume", k)} />
            </Section>
            <Section title="Panner" fx={true}>
              <PropRow label="Bilanciamento" p={audio.pan} ed={{ ...ed, lt: T - audio.start }} min={-100} max={100} onChange={(p, k) => upd(audio.id, (c) => ({ ...c, pan: p }), "Bilanciamento", k)} />
            </Section>
            <EffectRows list={audio.effects.filter((e) => getEffect(e.defId)?.audio)} ed={{ ...ed, lt: T - audio.start }} onChange={(list, label, key) => upd(audio.id, (c) => ({ ...c, effects: [...c.effects.filter((e) => !getEffect(e.defId)?.audio), ...list] }), label, key)} />
          </>
        )}
        <div className="h-10" />
      </div>
    </div>
  );
}

// ---- Proprietà / Grafica essenziale ---------------------------------------------------------------

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-[12px]">
      <span className="text-[#bdbdbd]">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const [o, setO] = useState(true);
  return (
    <div className="border-b border-[#2a2a2a] py-1.5">
      <button type="button" onClick={() => setO(!o)} className="flex w-full items-center gap-1 py-1 text-[12.5px] font-semibold text-[#e6e6e6]">
        {o ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        {title}
      </button>
      {o && <div className="pl-4">{children}</div>}
    </div>
  );
}

export function TextControls({ style, onChange }: { style: TextStyle; onChange: (s: TextStyle, key?: string) => void }) {
  const tog = (k: "bold" | "italic" | "underline" | "caps") => onChange({ ...style, [k]: !style[k] });
  return (
    <>
      <select value={style.font} onChange={(e) => onChange({ ...style, font: e.target.value })} className={clsx(field, "mb-2 w-full")} style={{ fontFamily: style.font }}>
        {FONTS.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>
            {f}
          </option>
        ))}
      </select>
      <Field label="Dimensione">
        <Scrub value={style.size} min={4} max={1000} decimals={0} onChange={(v) => onChange({ ...style, size: v }, "size")} />
      </Field>
      <div className="flex items-center gap-1 py-1">
        {(
          [
            ["bold", Bold],
            ["italic", Italic],
            ["underline", Underline],
          ] as const
        ).map(([k, Icon]) => (
          <button key={k} type="button" onClick={() => tog(k)} className={clsx("grid h-6 w-7 place-items-center rounded", style[k] ? "bg-[#3a3a3a] text-white" : "text-[#9a9a9a] hover:bg-white/10")}>
            <Icon size={13} />
          </button>
        ))}
        <button type="button" onClick={() => tog("caps")} className={clsx("h-6 rounded px-1.5 text-[11px] font-bold", style.caps ? "bg-[#3a3a3a] text-white" : "text-[#9a9a9a] hover:bg-white/10")}>
          TT
        </button>
        <span className="mx-1 h-4 w-px bg-[#3a3a3a]" />
        {(
          [
            ["left", AlignLeft],
            ["center", AlignCenter],
            ["right", AlignRight],
          ] as const
        ).map(([k, Icon]) => (
          <button key={k} type="button" onClick={() => onChange({ ...style, align: k })} className={clsx("grid h-6 w-7 place-items-center rounded", style.align === k ? "bg-[#3a3a3a] text-white" : "text-[#9a9a9a] hover:bg-white/10")}>
            <Icon size={13} />
          </button>
        ))}
      </div>
      <Field label="Spaziatura">
        <Scrub value={style.tracking} min={-200} max={2000} decimals={0} onChange={(v) => onChange({ ...style, tracking: v }, "track")} />
      </Field>
      <Field label="Interlinea">
        <Scrub value={style.leading} min={0.5} max={4} step={0.01} decimals={2} onChange={(v) => onChange({ ...style, leading: v }, "lead")} />
      </Field>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[#8a8a8a]">Aspetto</div>
      <Field label="Riempimento">
        <input type="color" value={style.color} onChange={(e) => onChange({ ...style, color: e.target.value }, "color")} className="h-5 w-8 cursor-pointer rounded-sm border border-[#4a4a4a] bg-transparent p-0" />
      </Field>
      <Field label="Traccia">
        <input type="checkbox" checked={style.stroke.on} onChange={(e) => onChange({ ...style, stroke: { ...style.stroke, on: e.target.checked } })} className="h-3.5 w-3.5 accent-[#2680eb]" />
        <input type="color" value={style.stroke.color} onChange={(e) => onChange({ ...style, stroke: { ...style.stroke, color: e.target.value } }, "sc")} className="h-5 w-8 cursor-pointer rounded-sm border border-[#4a4a4a] bg-transparent p-0" />
        <Scrub value={style.stroke.width} min={0} max={100} decimals={0} onChange={(v) => onChange({ ...style, stroke: { ...style.stroke, width: v } }, "sw")} />
      </Field>
      <Field label="Sfondo">
        <input type="checkbox" checked={style.background.on} onChange={(e) => onChange({ ...style, background: { ...style.background, on: e.target.checked } })} className="h-3.5 w-3.5 accent-[#2680eb]" />
        <input type="color" value={style.background.color} onChange={(e) => onChange({ ...style, background: { ...style.background, color: e.target.value } }, "bc")} className="h-5 w-8 cursor-pointer rounded-sm border border-[#4a4a4a] bg-transparent p-0" />
        <Scrub value={style.background.opacity} min={0} max={100} decimals={0} suffix="%" onChange={(v) => onChange({ ...style, background: { ...style.background, opacity: v } }, "bo")} />
      </Field>
      <Field label="Ombra">
        <input type="checkbox" checked={style.shadow.on} onChange={(e) => onChange({ ...style, shadow: { ...style.shadow, on: e.target.checked } })} className="h-3.5 w-3.5 accent-[#2680eb]" />
        <input type="color" value={style.shadow.color} onChange={(e) => onChange({ ...style, shadow: { ...style.shadow, color: e.target.value } }, "shc")} className="h-5 w-8 cursor-pointer rounded-sm border border-[#4a4a4a] bg-transparent p-0" />
        <Scrub value={style.shadow.distance} min={0} max={200} decimals={0} onChange={(v) => onChange({ ...style, shadow: { ...style.shadow, distance: v } }, "shd")} />
      </Field>
    </>
  );
}

function GraphicEditor({ c, seq }: { c: Clip; seq: Sequence }) {
  const st = usePremiere();
  const [layerId, setLayerId] = useState<string | null>(c.graphic?.[0]?.id ?? null);
  const layer = c.graphic?.find((g) => g.id === layerId) ?? c.graphic?.[0];
  const upd = (patch: Partial<GraphicLayer>, key?: string) => layer && A.updateGraphicLayer(c.id, layer.id, patch, key && layer.id + key);
  return (
    <>
      <Group title="Livelli">
        <div className="mb-1 flex gap-1">
          {(
            [
              ["text", Type, "Nuovo livello di testo"],
              ["rect", Square, "Rettangolo"],
              ["ellipse", Circle, "Ellisse"],
            ] as const
          ).map(([k, Icon, title]) => (
            <button
              key={k}
              type="button"
              title={title}
              onClick={() => {
                const g = newGraphicLayer(k, seq.width / 2, seq.height / 2, seq, "Nuovo testo");
                A.updateClip(c.id, (cl) => ({ ...cl, graphic: [...(cl.graphic ?? []), g] }), "Nuovo livello");
                setLayerId(g.id);
              }}
              className="grid h-6 w-7 place-items-center rounded text-[#bdbdbd] hover:bg-white/10"
            >
              <Icon size={13} />
            </button>
          ))}
          {layer && (
            <button type="button" title="Elimina livello" onClick={() => A.updateClip(c.id, (cl) => ({ ...cl, graphic: cl.graphic?.filter((g) => g.id !== layer.id) }), "Elimina livello")} className="ml-auto grid h-6 w-7 place-items-center rounded text-[#bdbdbd] hover:bg-white/10">
              <Trash2 size={13} />
            </button>
          )}
        </div>
        {[...(c.graphic ?? [])].reverse().map((g) => (
          <button key={g.id} type="button" onClick={() => setLayerId(g.id)} onDoubleClick={() => g.kind === "text" && st.set({ editingText: g.id })} className={clsx("flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[12px]", layer?.id === g.id ? "bg-[#2680eb]/40 text-white" : "text-[#d0d0d0] hover:bg-white/5")}>
            {g.kind === "text" ? <Type size={12} /> : g.kind === "rect" ? <Square size={12} /> : <Circle size={12} />}
            <span className="truncate">{g.kind === "text" ? g.text : g.name}</span>
          </button>
        ))}
      </Group>
      {layer && (
        <>
          <Group title="Allinea e trasforma">
            <Field label="Posizione">
              <Scrub value={layer.x} decimals={0} onChange={(v) => upd({ x: v }, "x")} />
              <Scrub value={layer.y} decimals={0} onChange={(v) => upd({ y: v }, "y")} />
            </Field>
            <Field label="Scala">
              <Scrub value={layer.scale} min={0} max={2000} decimals={0} suffix="%" onChange={(v) => upd({ scale: v }, "s")} />
            </Field>
            <Field label="Rotazione">
              <Scrub value={layer.rotation} decimals={0} suffix="°" onChange={(v) => upd({ rotation: v }, "r")} />
            </Field>
            <Field label="Opacità">
              <Scrub value={layer.opacity} min={0} max={100} decimals={0} suffix="%" onChange={(v) => upd({ opacity: v }, "o")} />
            </Field>
            <div className="flex gap-1 py-1">
              <button type="button" onClick={() => upd({ x: seq.width / 2 })} className="rounded bg-[#2e2e2e] px-2 py-1 text-[11px] text-[#d0d0d0] hover:bg-[#3a3a3a]">
                Centra orizzontalmente
              </button>
              <button type="button" onClick={() => upd({ y: seq.height / 2 })} className="rounded bg-[#2e2e2e] px-2 py-1 text-[11px] text-[#d0d0d0] hover:bg-[#3a3a3a]">
                Centra verticalmente
              </button>
            </div>
          </Group>
          {layer.kind === "text" ? (
            <Group title="Testo">
              <textarea value={layer.text} onChange={(e) => upd({ text: e.target.value }, "text")} onKeyDown={(e) => e.stopPropagation()} rows={2} className="mb-2 w-full rounded border border-[#3e3e3e] bg-[#151515] p-1.5 text-[12px] text-white outline-none focus:border-[#2680eb]" />
              <TextControls style={layer.style} onChange={(s, key) => upd({ style: s }, key)} />
            </Group>
          ) : (
            <Group title="Forma">
              <Field label="Dimensione">
                <Scrub value={layer.w} min={1} max={8000} decimals={0} onChange={(v) => upd({ w: v }, "w")} />
                <Scrub value={layer.h} min={1} max={8000} decimals={0} onChange={(v) => upd({ h: v }, "h")} />
              </Field>
              <Field label="Riempimento">
                <input type="color" value={layer.fill} onChange={(e) => upd({ fill: e.target.value }, "fill")} className="h-5 w-8 cursor-pointer rounded-sm border border-[#4a4a4a] bg-transparent p-0" />
              </Field>
            </Group>
          )}
        </>
      )}
    </>
  );
}

export function PropertiesPanel() {
  const st = usePremiere();
  const seq = seqOf(st);
  const T = playheadOf(st);
  const clip = seq?.clips.find((c) => st.selection.includes(c.id) && isVideoTrack(seq, c.track)) ?? seq?.clips.find((c) => st.selection.includes(c.id));
  if (!seq || !clip) return <div className="grid h-full place-items-center px-4 text-center text-[12.5px] text-[#8a8a8a]">Seleziona una clip per vederne le proprietà</div>;
  const lt = T - clip.start;
  const isV = isVideoTrack(seq, clip.track);
  const set = (fn: (c: Clip) => Clip, label: string, key: string) => A.updateClip(clip.id, fn, label, clip.id + key);
  const pos = valueAt(clip.motion.position, lt);
  return (
    <div className="h-full overflow-y-auto px-3 pb-6">
      <div className="flex items-center gap-2 py-2 text-[13px] font-semibold text-white">
        {clip.graphic ? <Type size={14} /> : isV ? <Video size={14} /> : <AudioLines size={14} />}
        <span className="truncate">{clip.name}</span>
        <Ellipsis size={14} className="ml-auto text-[#9a9a9a]" />
      </div>
      {clip.graphic && <GraphicEditor c={clip} seq={seq} />}
      {isV && (
        <Group title="Trasforma">
          <Field label="Posizione">
            <Scrub value={pos[0]} decimals={0} onChange={(v) => set((c) => ({ ...c, motion: { ...c.motion, position: setAt(c.motion.position, [v, valueAt(c.motion.position, lt)[1]], lt, seq.fps) } }), "Posizione", "px")} />
            <Scrub value={pos[1]} decimals={0} onChange={(v) => set((c) => ({ ...c, motion: { ...c.motion, position: setAt(c.motion.position, [valueAt(c.motion.position, lt)[0], v], lt, seq.fps) } }), "Posizione", "py")} />
          </Field>
          <Field label="Scala">
            <Scrub value={valueAt(clip.motion.scale, lt)[0]} min={0} max={10000} decimals={1} suffix="%" onChange={(v) => set((c) => ({ ...c, motion: { ...c.motion, scale: setAt(c.motion.scale, [v], lt, seq.fps) } }), "Scala", "s")} />
          </Field>
          <Field label="Rotazione">
            <Scrub value={valueAt(clip.motion.rotation, lt)[0]} decimals={1} suffix="°" onChange={(v) => set((c) => ({ ...c, motion: { ...c.motion, rotation: setAt(c.motion.rotation, [v], lt, seq.fps) } }), "Rotazione", "r")} />
          </Field>
          <Field label="Opacità">
            <Scrub value={valueAt(clip.opacity, lt)[0]} min={0} max={100} decimals={1} suffix="%" onChange={(v) => set((c) => ({ ...c, opacity: setAt(c.opacity, [v], lt, seq.fps) }), "Opacità", "o")} />
          </Field>
          <div className="flex gap-1 py-1">
            <button type="button" onClick={() => A.scaleToFrame(true)} className="rounded bg-[#2e2e2e] px-2 py-1 text-[11px] text-[#d0d0d0] hover:bg-[#3a3a3a]">
              Adatta al fotogramma
            </button>
            <button type="button" onClick={() => A.scaleToFrame(false)} className="rounded bg-[#2e2e2e] px-2 py-1 text-[11px] text-[#d0d0d0] hover:bg-[#3a3a3a]">
              Riempi il fotogramma
            </button>
          </div>
        </Group>
      )}
      {!isV && (
        <Group title="Audio">
          <Field label="Volume">
            <Scrub value={valueAt(clip.volume, lt)[0]} min={-60} max={15} step={0.2} decimals={1} suffix=" dB" onChange={(v) => set((c) => ({ ...c, volume: setAt(c.volume, [v], lt, seq.fps) }), "Volume", "v")} />
          </Field>
          <Field label="Bilanciamento">
            <Scrub value={valueAt(clip.pan, lt)[0]} min={-100} max={100} decimals={0} onChange={(v) => set((c) => ({ ...c, pan: setAt(c.pan, [v], lt, seq.fps) }), "Bilanciamento", "pan")} />
          </Field>
        </Group>
      )}
      <Group title="Velocità">
        <Field label="Velocità">
          <span className="text-[#d0d0d0]">{(clip.speed * 100).toFixed(0)}%</span>
          <button type="button" onClick={() => st.set({ dialog: { type: "speed", ids: st.selection } })} className="rounded bg-[#2e2e2e] px-2 py-0.5 text-[11px] text-[#d0d0d0] hover:bg-[#3a3a3a]">
            Modifica…
          </button>
        </Field>
        <Field label="Durata">
          <span className="font-mono text-[#d0d0d0]">{timecode(clipDur(clip), seq.fps)}</span>
        </Field>
      </Group>
    </div>
  );
}

const TEMPLATES = [
  { name: "Titolo semplice", text: "IL MIO TITOLO", y: 0.5, size: 0.11, bg: false },
  { name: "Terzo inferiore", text: "Nome Cognome\nRuolo", y: 0.82, size: 0.05, bg: true },
  { name: "Sottotitolo", text: "Questo è un sottotitolo", y: 0.9, size: 0.045, bg: true },
  { name: "Didascalia grande", text: "CAPITOLO 1", y: 0.5, size: 0.16, bg: false },
];

export function EssentialGraphics() {
  const st = usePremiere();
  const seq = seqOf(st);
  const [tab, setTab] = useState<"Sfoglia" | "Modifica">("Sfoglia");
  const clip = seq?.clips.find((c) => st.selection.includes(c.id) && c.graphic);
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 gap-4 border-b border-[#2a2a2a] px-3 py-1.5 text-[12px]">
        {(["Sfoglia", "Modifica"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={tab === t ? "text-white underline underline-offset-4" : "text-[#9a9a9a]"}>
            {t}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "Sfoglia" ? (
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((tp) => (
              <button
                key={tp.name}
                type="button"
                title="Clic per aggiungere all'indicatore"
                onClick={() => {
                  if (!seq) return st.notify("Apri prima una sequenza");
                  A.createGraphic("text", seq.width / 2, seq.height * tp.y);
                  const s = usePremiere.getState();
                  const c = seqOf(s)?.clips.find((k) => s.selection.includes(k.id));
                  const g = c?.graphic?.[0];
                  if (c && g) A.updateGraphicLayer(c.id, g.id, { text: tp.text, style: { ...g.style, size: Math.round(seq.height * tp.size), background: { ...g.style.background, on: tp.bg } } });
                  s.set({ editingText: null, tool: "select" });
                }}
                className="overflow-hidden rounded border border-[#2e2e2e] text-left hover:border-[#2680eb]"
              >
                <div className="relative grid aspect-video place-items-center bg-[#0e0e0e] text-[10px] font-black text-white" style={{ alignItems: tp.y > 0.7 ? "end" : "center" }}>
                  <span className={clsx("mb-2 whitespace-pre text-center", tp.bg && "bg-black/70 px-1")}>{tp.text}</span>
                </div>
                <div className="truncate px-1.5 py-1 text-[11px] text-[#d0d0d0]">{tp.name}</div>
              </button>
            ))}
          </div>
        ) : clip && seq ? (
          <GraphicEditor c={clip} seq={seq} />
        ) : (
          <p className="text-[12px] text-[#8a8a8a]">Seleziona una grafica nella timeline, oppure usa lo strumento Testo (T) nel monitor Programma.</p>
        )}
      </div>
    </div>
  );
}

export function TextPanel() {
  const st = usePremiere();
  const seq = seqOf(st);
  const caps = seq?.clips.filter((c) => c.graphic?.some((g) => g.kind === "text")) ?? [];
  return (
    <div className="flex h-full flex-col p-3 text-[12px]">
      <div className="mb-2 flex gap-4">
        <span className="text-white underline underline-offset-4">Trascrizione</span>
        <span className="text-[#9a9a9a]">Sottotitoli</span>
        <span className="text-[#9a9a9a]">Grafica</span>
      </div>
      {caps.length ? (
        <div className="space-y-1 overflow-y-auto">
          {caps.map((c) => (
            <button key={c.id} type="button" onClick={() => (st.select(c.id), st.setPlayhead(c.start))} className="block w-full rounded px-2 py-1.5 text-left hover:bg-white/5">
              <span className="font-mono text-[#3d9cf0]">{timecode(c.start, seq!.fps)}</span> <span className="text-[#d0d0d0]">{c.graphic?.find((g) => g.kind === "text")?.text}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[#8a8a8a]">La trascrizione automatica del parlato non è disponibile nel simulatore. Qui compaiono i testi delle grafiche della sequenza.</p>
      )}
    </div>
  );
}

export function AudioMixer() {
  const st = usePremiere();
  const seq = seqOf(st);
  const T = playheadOf(st);
  if (!seq) return null;
  return (
    <div className="flex h-full gap-2 overflow-x-auto p-3">
      {audioTracks(seq).map((t) => {
        const c = clipAt(seq, t.id, T);
        const v = c ? valueAt(c.volume, T - c.start)[0] : 0;
        return (
          <div key={t.id} className="flex w-20 shrink-0 flex-col items-center gap-2 rounded bg-[#232323] p-2 text-[11px]">
            <span className="font-semibold text-white">{trackLabel(seq, t.id)}</span>
            <Scrub value={c ? valueAt(c.pan, T - c.start)[0] : 0} min={-100} max={100} decimals={0} disabled={!c} onChange={(p) => c && A.updateClip(c.id, (k) => ({ ...k, pan: setAt(k.pan, [p], T - k.start, seq.fps) }), "Bilanciamento", "mixpan" + c.id)} />
            <input
              type="range"
              min={-60}
              max={15}
              step={0.1}
              value={v}
              disabled={!c}
              onChange={(e) => c && A.updateClip(c.id, (k) => ({ ...k, volume: setAt(k.volume, [Number(e.target.value)], T - k.start, seq.fps) }), "Volume", "mixvol" + c.id)}
              className="h-32 w-5 accent-[#2680eb] [writing-mode:vertical-lr] [direction:rtl]"
            />
            <span className="font-mono text-[#3d9cf0]">{c ? v.toFixed(1) : "—"}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => A.updateTrack(t.id, { off: !t.off }, "Disattiva audio")} className={clsx("h-4 w-4 rounded-[2px] text-[9px] font-bold", t.off ? "bg-[#3eaa52] text-black" : "bg-[#3a3a3a]")}>
                M
              </button>
              <button type="button" onClick={() => A.updateTrack(t.id, { solo: !t.solo }, "Solo")} className={clsx("h-4 w-4 rounded-[2px] text-[9px] font-bold", t.solo ? "bg-[#e8d43a] text-black" : "bg-[#3a3a3a]")}>
                S
              </button>
            </div>
            <span className="truncate text-[#9a9a9a]">{c?.name ?? "—"}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Metadata() {
  const st = usePremiere();
  const seq = seqOf(st);
  const clip = seq?.clips.find((c) => st.selection.includes(c.id));
  const item = st.project.items.find((i) => st.projectSel.includes(i.id));
  const m = clip ? st.project.media[clip.mediaId] : item?.type === "media" ? st.project.media[item.ref!] : undefined;
  if (!m) return <div className="grid h-full place-items-center text-[12.5px] text-[#8a8a8a]">(nessun elemento selezionato)</div>;
  const rows: [string, string][] = [
    ["Nome", m.name],
    ["Tipo", m.kind],
    ["Dimensioni", m.width ? `${m.width} × ${m.height}` : "—"],
    ["Frequenza fotogrammi", `${m.fps} fps`],
    ["Durata", timecode(m.duration, m.fps)],
    ["Audio", m.hasAudio ? "Sì" : "No"],
    ...(m.file ? ([["File", `${m.file.mime} · ${fmtSize(m.file.size)}`]] as [string, string][]) : []),
  ];
  return (
    <div className="h-full overflow-y-auto p-3 text-[12px]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between border-b border-[#2a2a2a] py-1.5">
          <span className="text-[#9a9a9a]">{k}</span>
          <span className="text-[#e0e0e0]">{v}</span>
        </div>
      ))}
    </div>
  );
}
