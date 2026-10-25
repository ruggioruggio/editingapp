"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignStartHorizontal, AlignStartVertical, ChevronDown, ChevronRight, Film, Folder, FolderOpen, FolderPlus, Layers, Music, RotateCcw, Search, Sparkles, Trash2, Image as ImageIcon, SquarePlus } from "lucide-react";
import { setAt, toggleStopwatch, valueAt, type Prop } from "@/lib/studio/anim";
import { EFFECTS, EFFECT_CATEGORIES, getEffect, hexToRgb, rgbToHex } from "@/lib/studio/effects";
import { SAMPLE_LIBRARY } from "@/lib/studio/media";
import { AE_LABELS, compOf, timeOf, useAe, withProp, type AeItem, type Layer } from "@/lib/studio/ae";
import type { MenuItemLike } from "@/lib/studio/premiere";
import { Scrub } from "../chrome";
import { Thumb } from "../render";
import { TextControls } from "../premiere/Inspectors";
import { aeTime } from "./AeTimeline";
import * as A from "./actions";

export const openAeImport = () => document.getElementById("ae-import-input")?.click();

// ---- Progetto ----------------------------------------------------------------------------

export function AeProjectPanel() {
  const st = useAe();
  const { project, projectSel, folder } = st;
  const [q, setQ] = useState("");
  const [openF, setOpenF] = useState<Set<string>>(new Set());
  const selItem = project.items.find((i) => i.id === projectSel[0]);
  const selMedia = selItem?.type === "footage" ? project.media[selItem.ref!] : undefined;
  const selComp = selItem?.type === "comp" ? project.comps[selItem.ref!] : undefined;

  const open = (it: AeItem) => {
    if (it.type === "folder") return setOpenF((s) => (s.has(it.id) ? new Set([...s].filter((x) => x !== it.id)) : new Set([...s, it.id])));
    if (it.type === "comp") return st.openComp(it.ref!);
    A.addMediaLayer(it.ref!);
  };
  const menu = (e: React.MouseEvent, it?: AeItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (it && !projectSel.includes(it.id)) st.set({ projectSel: [it.id] });
    const items: MenuItemLike[] = it
      ? [
          { label: "Rinomina", action: () => st.set({ dialog: { type: "rename", title: "Rinomina", value: it.name, onOk: (v) => A.renameItem(it.id, v) } }) },
          { label: "Elimina", keys: "Canc", action: () => A.deleteItems(projectSel.includes(it.id) ? projectSel : [it.id]) },
          "-",
          ...(it.type === "footage"
            ? ([
                { label: "Nuova composizione da selezione", action: () => A.compFromFootage(it.ref!) },
                { label: "Aggiungi alla composizione", keys: "Ctrl+/", action: () => A.addMediaLayer(it.ref!) },
              ] as MenuItemLike[])
            : it.type === "comp"
              ? ([
                  { label: "Apri composizione", action: () => st.openComp(it.ref!) },
                  { label: "Impostazioni composizione…", action: () => st.set({ dialog: { type: "comp", id: it.ref } }) },
                  { label: "Aggiungi alla composizione attiva", action: () => A.addCompLayer(it.ref!) },
                ] as MenuItemLike[])
              : []),
          { label: "Etichetta", sub: AE_LABELS.map(([n], i) => ({ label: n, checked: it.label === i, action: () => st.commit((p) => ({ ...p, items: p.items.map((x) => (x.id === it.id ? { ...x, label: i } : x)) }), "Etichetta") })) },
        ]
      : [
          { label: "Nuova composizione…", keys: "Ctrl+N", action: () => st.set({ dialog: { type: "comp" } }) },
          { label: "Nuova cartella", keys: "Ctrl+Alt+Maiusc+N", action: A.newFolder },
          "-",
          { label: "Importa", sub: [{ label: "File…", keys: "Ctrl+I", action: openAeImport }, ...SAMPLE_LIBRARY.map((m) => ({ label: `Esempio: ${m.name}`, action: () => A.importSample((({ folder: _f, ...r }) => (void _f, r))(m)) }))] },
        ];
    st.set({ menu: { x: e.clientX, y: e.clientY, items } });
  };

  const rows: { it: AeItem; depth: number }[] = [];
  const walk = (parent: string | null, depth: number) => {
    for (const it of project.items.filter((i) => i.parent === parent && (!q || i.type === "folder" || i.name.toLowerCase().includes(q.toLowerCase())))) {
      rows.push({ it, depth });
      if (it.type === "folder" && (openF.has(it.id) || q)) walk(it.id, depth + 1);
    }
  };
  walk(null, 0);

  return (
    <div className="flex h-full flex-col text-[12px]" onContextMenu={(e) => menu(e)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) void A.importFiles(e.dataTransfer.files);
    }}>
      <div className="flex shrink-0 gap-2 px-2 pb-2">
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-black">{selMedia ? <Thumb media={selMedia} /> : selComp ? <div className="h-full w-full" style={{ background: selComp.bg }} /> : null}</div>
        <div className="min-w-0 text-[11.5px] leading-[1.35] text-[#d0d0d0]">
          {selComp ? (
            <>
              <p className="truncate">{selComp.name} ▾</p>
              <p>
                {selComp.width} x {selComp.height} (1,00)
              </p>
              <p>
                Δ {aeTime(selComp.duration, selComp.fps)}, {selComp.fps.toFixed(2).replace(".", ",")} fps
              </p>
            </>
          ) : selMedia ? (
            <>
              <p className="truncate">{selMedia.name} ▾</p>
              {selMedia.width ? <p>{selMedia.width} x {selMedia.height} (1,00)</p> : null}
              <p>Δ {aeTime(selMedia.duration, selMedia.fps)}, {selMedia.fps} fps</p>
              {selMedia.hasAudio && <p>48,000 kHz / 32 bit U / Stereo</p>}
            </>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 px-2 pb-1">
        <label className="flex h-6 flex-1 items-center gap-1 rounded border border-[#3a3a3a] bg-[#151515] px-2">
          <Search size={12} className="text-[#8a8a8a]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="min-w-0 flex-1 bg-transparent text-[#e0e0e0] outline-none" />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[560px] text-[11.5px]">
          <thead className="sticky top-0 bg-[#1e1e1e] text-left text-[#9a9a9a]">
            <tr className="border-b border-[#2a2a2a]">
              {["Nome", "", "Tipo", "Dimensioni", "Frequenza", "Attacco", "Stacco"].map((h, i) => (
                <th key={i} className="whitespace-nowrap px-1.5 py-1 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody onPointerDown={(e) => e.target === e.currentTarget && st.set({ projectSel: [] })}>
            {rows.map(({ it, depth }) => {
              const m = it.type === "footage" ? project.media[it.ref!] : undefined;
              const c = it.type === "comp" ? project.comps[it.ref!] : undefined;
              const sel = projectSel.includes(it.id);
              const Icon = it.type === "folder" ? (openF.has(it.id) ? FolderOpen : Folder) : it.type === "comp" ? Layers : m?.kind === "audio" ? Music : m?.kind === "image" ? ImageIcon : Film;
              return (
                <tr
                  key={it.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/x-ae-item", it.id)}
                  onDragOver={(e) => it.type === "folder" && e.preventDefault()}
                  onDrop={(e) => {
                    if (it.type !== "folder") return;
                    e.stopPropagation();
                    const id = e.dataTransfer.getData("text/x-ae-item");
                    if (id && id !== it.id) st.commit((p) => ({ ...p, items: p.items.map((x) => (x.id === id ? { ...x, parent: it.id } : x)) }), "Sposta");
                  }}
                  onClick={(e) => st.set({ projectSel: e.ctrlKey || e.metaKey ? [...projectSel, it.id] : [it.id] })}
                  onDoubleClick={() => open(it)}
                  onContextMenu={(e) => menu(e, it)}
                  className={clsx("h-[21px]", sel ? "bg-[#4a4a4a] text-white" : "text-[#d6d6d6] hover:bg-white/5")}
                >
                  <td className="whitespace-nowrap px-1.5">
                    <span className="flex items-center gap-1.5" style={{ paddingLeft: depth * 14 }}>
                      {it.type === "folder" && (openF.has(it.id) ? <ChevronDown size={11} /> : <ChevronRight size={11} />)}
                      <Icon size={13} className={it.type === "folder" ? "text-[#e8a23a]" : it.type === "comp" ? "text-[#bdbdbd]" : "text-[#9a9a9a]"} />
                      <span className="truncate">{it.name}</span>
                    </span>
                  </td>
                  <td>
                    <span className="block h-2.5 w-2.5 rounded-sm" style={{ background: AE_LABELS[it.label]?.[1] }} />
                  </td>
                  <td className="whitespace-nowrap px-1.5">{it.type === "folder" ? "Cartella" : it.type === "comp" ? "Composizione" : m?.kind === "audio" ? "WAV" : m?.kind === "image" ? "PNG" : "MPEG"}</td>
                  <td className="whitespace-nowrap px-1.5">{c ? `${c.width}x${c.height}` : m?.width ? `${m.width}x${m.height}` : ""}</td>
                  <td className="px-1.5">{c ? c.fps : m ? m.fps : ""}</td>
                  <td className="whitespace-nowrap px-1.5 font-mono">{c || m ? "0:00:00:00" : ""}</td>
                  <td className="whitespace-nowrap px-1.5 font-mono">{c ? aeTime(c.duration, c.fps) : m ? aeTime(m.duration, m.fps) : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex h-7 shrink-0 items-center gap-1 px-2 text-[#bdbdbd]">
        <button type="button" title="Interpreta metraggio" className="grid h-5 w-6 place-items-center rounded hover:bg-white/10" onClick={() => st.notify("Interpreta metraggio: frequenza e canale alfa vengono rilevati in automatico")}>
          <Film size={13} />
        </button>
        <button type="button" title="Crea una nuova cartella" onClick={A.newFolder} className="grid h-5 w-6 place-items-center rounded hover:bg-white/10">
          <FolderPlus size={13} />
        </button>
        <button type="button" title="Crea una nuova composizione" onClick={() => st.set({ dialog: { type: "comp" } })} className="grid h-5 w-6 place-items-center rounded hover:bg-white/10">
          <SquarePlus size={13} />
        </button>
        <span className="rounded border border-[#3a3a3a] px-2 text-[11px]">8 bpc</span>
        <button type="button" title="Elimina" onClick={() => projectSel.length && A.deleteItems(projectSel)} className="grid h-5 w-6 place-items-center rounded hover:bg-white/10">
          <Trash2 size={13} />
        </button>
        <span className="ml-auto text-[10.5px] text-[#7a7a7a]">{folder ? "" : "Trascina qui i file dal computer"}</span>
      </div>
    </div>
  );
}

// ---- Controlli effetti ---------------------------------------------------------------------

function EcRow({ name, p, t, fps, onChange, input, dims = 1, step = 1, suffix = "", min, max }: { name: string; p: Prop; t: number; fps: number; onChange: (p: Prop, key?: string) => void; input?: ReactNode; dims?: number; step?: number; suffix?: string; min?: number; max?: number }) {
  const v = valueAt(p, t);
  return (
    <div className="flex h-[22px] items-center gap-1.5 pl-8 pr-2 text-[12px]">
      <button type="button" onClick={() => onChange(toggleStopwatch(p, t, fps))} title="Cronometro">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={p.keys ? "#3d9cf0" : "#9a9a9a"} strokeWidth="1.2">
          <circle cx="7" cy="8" r="5" />
          <path d="M7 8V5M5.5 1.5h3M7 1.5V3" />
        </svg>
      </button>
      <span className="w-[46%] truncate text-[#d0d0d0]">{name}</span>
      <span className="flex items-center gap-2">
        {input ??
          v.slice(0, dims).map((x, d) => (
            <Scrub
              key={d}
              value={x}
              step={step}
              min={min}
              max={max}
              suffix={suffix}
              decimals={step < 1 ? 2 : 1}
              onChange={(nv) => {
                const n = [...valueAt(p, t)];
                n[d] = nv;
                onChange(setAt(p, n, t, fps), name + d);
              }}
            />
          ))}
      </span>
    </div>
  );
}

export function AeEffectControls() {
  const st = useAe();
  const comp = compOf(st);
  const t = timeOf(st);
  const l = comp?.layers.find((x) => st.selected.includes(x.id));
  const [closed, setClosed] = useState<Set<string>>(new Set());
  if (!comp || !l) return <div className="grid h-full place-items-center text-[12px] text-[#8a8a8a]">(nessun livello selezionato)</div>;
  const upd = (fn: (x: Layer) => Layer, label: string, key?: string) => A.updateLayer(l.id, fn, label, key && l.id + key);
  return (
    <div className="h-full overflow-y-auto pb-6" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
      const fx = e.dataTransfer.getData("text/x-fx");
      if (fx) A.applyEffect(fx, [l.id]);
    }}>
      <div className="px-3 py-1 text-[11.5px] text-[#9a9a9a]">
        {comp.name} • {l.name}
      </div>
      {!l.effects.length && <p className="px-3 py-4 text-[12px] text-[#7a7a7a]">Nessun effetto. Trascina un effetto da &quot;Effetti e predefiniti&quot; o usa il menu Effetto.</p>}
      {l.effects.map((fx, ei) => {
        const def = getEffect(fx.defId);
        if (!def) return null;
        const open = !closed.has(fx.id);
        return (
          <div key={fx.id} onContextMenu={(e) => {
            e.preventDefault();
            st.set({ menu: { x: e.clientX, y: e.clientY, items: [
              { label: "Elimina effetto", action: () => upd((x) => ({ ...x, effects: x.effects.filter((y) => y.id !== fx.id) }), "Rimuovi effetto") },
              { label: "Duplica effetto", action: () => upd((x) => ({ ...x, effects: [...x.effects.slice(0, ei + 1), { ...fx, id: fx.id + "c" + Date.now() % 1000 }, ...x.effects.slice(ei + 1)] }), "Duplica effetto") },
              { label: "Sposta su", disabled: ei === 0, action: () => upd((x) => { const a = [...x.effects]; [a[ei - 1], a[ei]] = [a[ei], a[ei - 1]]; return { ...x, effects: a }; }, "Riordina effetti") },
              { label: "Sposta giù", disabled: ei === l.effects.length - 1, action: () => upd((x) => { const a = [...x.effects]; [a[ei + 1], a[ei]] = [a[ei], a[ei + 1]]; return { ...x, effects: a }; }, "Riordina effetti") },
            ] } });
          }}>
            <div className="flex h-[24px] items-center gap-1.5 px-2 text-[12px]">
              <button type="button" onClick={() => setClosed((s) => (s.has(fx.id) ? new Set([...s].filter((x) => x !== fx.id)) : new Set([...s, fx.id])))} className="text-[#9a9a9a]">
                {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <button type="button" onClick={() => upd((x) => ({ ...x, effects: x.effects.map((y) => (y.id === fx.id ? { ...y, enabled: !y.enabled } : y)) }), "Attiva/disattiva effetto")} className={clsx("italic font-bold", fx.enabled ? "text-[#d0d0d0]" : "text-[#5a5a5a] line-through")}>
                fx
              </button>
              <span className="font-semibold text-[#e6e6e6]">{def.name}</span>
              <button type="button" onClick={() => upd((x) => ({ ...x, effects: x.effects.map((y) => (y.id === fx.id ? { ...y, params: Object.fromEntries(def.params.map((p) => [p.id, { value: typeof p.default === "function" ? p.default(x.w || comp.width, x.h || comp.height) : p.default, keys: null }])) } : y)) }), "Ripristina")} className="ml-auto flex items-center gap-1 text-[11px] text-[#3d9cf0] hover:underline">
                <RotateCcw size={10} /> Ripristina
              </button>
            </div>
            {open &&
              def.params.map((pd) => {
                const p = fx.params[pd.id];
                const path = `e.${ei}.${pd.id}`;
                const v = valueAt(p, t);
                const set = (np: Prop, key?: string) => upd((x) => withProp(x, path, np), pd.name, key && path + key);
                const input =
                  pd.type === "color" ? (
                    <input type="color" value={rgbToHex(v)} onChange={(e) => set(setAt(p, hexToRgb(e.target.value), t, comp.fps), "c")} className="h-4 w-8 cursor-pointer border border-[#4a4a4a] bg-transparent p-0" />
                  ) : pd.type === "checkbox" ? (
                    <input type="checkbox" checked={!!v[0]} onChange={(e) => set(setAt(p, [e.target.checked ? 1 : 0], t, comp.fps))} className="h-3.5 w-3.5 accent-[#2680eb]" />
                  ) : pd.type === "select" ? (
                    <select value={v[0]} onChange={(e) => set(setAt(p, [Number(e.target.value)], t, comp.fps))} className="h-5 rounded-sm border border-[#3e3e3e] bg-[#151515] px-1 text-[11.5px] text-[#d0d0d0] outline-none">
                      {pd.options!.map((o, i) => (
                        <option key={o} value={i}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : undefined;
                return <EcRow key={pd.id} name={pd.name} p={p} t={t} fps={comp.fps} onChange={set} input={input} dims={pd.type === "point" ? 2 : 1} step={pd.step ?? 1} suffix={pd.suffix ?? (pd.type === "angle" ? "°" : "")} min={pd.min} max={pd.max} />;
              })}
          </div>
        );
      })}
    </div>
  );
}

// ---- Effetti e predefiniti ------------------------------------------------------------------

const AE_PRESETS = [
  { id: "fadein", name: "Dissolvenza in entrata" },
  { id: "pop", name: "Pop (scala con rimbalzo)" },
  { id: "slide", name: "Scorri da sinistra" },
  { id: "wiggle", name: "Tremolio (espressione wiggle)" },
  { id: "spin", name: "Rotazione continua (espressione)" },
];

export function applyAePreset(id: string) {
  const s = useAe.getState();
  const c = compOf(s);
  if (!c || !s.selected.length) return s.notify("Seleziona un livello");
  const t = timeOf(s);
  const k = (tt: number, v: number[], e = false) => ({ id: Math.random().toString(36).slice(2), t: tt, v, easeIn: e, easeOut: e, hold: false });
  s.commitComp(
    (x) => ({
      ...x,
      layers: x.layers.map((l) => {
        if (!s.selected.includes(l.id)) return l;
        const T = l.transform;
        const pos = valueAt(T.position, t);
        if (id === "fadein") return { ...l, transform: { ...T, opacity: { ...T.opacity, keys: [k(t, [0]), k(t + 0.5, [100])] } } };
        if (id === "pop") return { ...l, transform: { ...T, scale: { ...T.scale, keys: [k(t, [0, 0], true), k(t + 0.3, [115, 115], true), k(t + 0.5, [100, 100], true)] } } };
        if (id === "slide") return { ...l, transform: { ...T, position: { ...T.position, keys: [k(t, [-400, ...pos.slice(1)], true), k(t + 0.8, pos, true)] } } };
        if (id === "wiggle") return { ...l, transform: { ...T, position: { ...T.position, expr: "wiggle(3, 25)" } } };
        return { ...l, transform: { ...T, rotation: { ...T.rotation, expr: "time * 120" } } };
      }),
    }),
    "Applica predefinito animazione",
  );
}

export function AeEffectsPresets() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const fx = EFFECTS.filter((e) => !e.audio && e.only !== "pr");
  const tog = (k: string) => setOpen((s) => (s.has(k) ? new Set([...s].filter((x) => x !== k)) : new Set([...s, k])));
  const Leaf = ({ id, name, preset }: { id: string; name: string; preset?: boolean }) => (
    <div
      draggable={!preset}
      onDragStart={(e) => e.dataTransfer.setData("text/x-fx", id)}
      onDoubleClick={() => (preset ? applyAePreset(id) : A.applyEffect(id))}
      title="Doppio clic per applicare al livello selezionato"
      className="flex cursor-grab items-center gap-1.5 py-[3px] pl-9 text-[12px] text-[#d6d6d6] hover:bg-white/5"
    >
      <Sparkles size={11} className="text-[#3d9cf0]" />
      {name}
    </div>
  );
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-2 pb-2">
        <label className="flex h-6 items-center gap-1 rounded border border-[#3a3a3a] bg-[#151515] px-2 text-[12px]">
          <Search size={12} className="text-[#8a8a8a]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="Cerca" className="min-w-0 flex-1 bg-transparent text-[#e0e0e0] outline-none" />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-3">
        {q ? (
          fx.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())).map((e) => <Leaf key={e.id} id={e.id} name={e.name} />)
        ) : (
          <>
            <button type="button" onClick={() => tog("presets")} className="flex w-full items-center gap-1 px-2 py-[3px] text-left text-[12px] text-[#d0d0d0] hover:bg-white/5">
              {open.has("presets") ? <ChevronDown size={12} /> : <ChevronRight size={12} />}* Predefiniti animazione
            </button>
            {open.has("presets") && AE_PRESETS.map((p) => <Leaf key={p.id} id={p.id} name={p.name} preset />)}
            {EFFECT_CATEGORIES.filter((c) => fx.some((e) => e.category === c)).map((cat) => (
              <div key={cat}>
                <button type="button" onClick={() => tog(cat)} className="flex w-full items-center gap-1 px-2 py-[3px] text-left text-[12px] text-[#d0d0d0] hover:bg-white/5">
                  {open.has(cat) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {cat}
                </button>
                {open.has(cat) &&
                  fx
                    .filter((e) => e.category === cat)
                    .map((e) => <Leaf key={e.id} id={e.id} name={e.name} />)}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ---- Proprietà / Carattere / Allinea / Tracciatore ------------------------------------------------

export function AeProperties() {
  const st = useAe();
  const comp = compOf(st);
  const t = timeOf(st);
  const l = comp?.layers.find((x) => st.selected.includes(x.id));
  if (!comp || !l) return <div className="grid h-full place-items-center px-6 text-center text-[12px] text-[#8a8a8a]">Seleziona un livello per vederne le proprietà</div>;
  const T = l.transform;
  const row = (name: string, path: string, p: Prop, dims: number, suffix = "") => (
    <div className="flex h-[24px] items-center justify-between gap-2 text-[12px]">
      <span className="text-[#bdbdbd]">{name}</span>
      <span className="flex gap-2">
        {valueAt(p, t)
          .slice(0, dims)
          .map((v, d) => (
            <Scrub
              key={d}
              value={v}
              suffix={suffix}
              onChange={(nv) => {
                const n = [...valueAt(p, t)];
                n[d] = nv;
                A.updateLayer(l.id, (x) => withProp(x, path, setAt(p, n, t, comp.fps)), name, l.id + path + d);
              }}
            />
          ))}
      </span>
    </div>
  );
  return (
    <div className="h-full overflow-y-auto px-3 pb-6">
      <p className="py-2 text-[13px] font-semibold text-white">{l.name}</p>
      <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#8a8a8a]">Trasformazione livello</p>
      {row("Punto di ancoraggio", "t.anchor", T.anchor, 2)}
      {row("Posizione", "t.position", T.position, l.threeD ? 3 : 2)}
      {row("Scala", "t.scale", T.scale, 2, "%")}
      {row("Rotazione", "t.rotation", T.rotation, 1, "°")}
      {row("Opacità", "t.opacity", T.opacity, 1, "%")}
      {l.type === "text" && l.textStyle && (
        <>
          <p className="pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-[#8a8a8a]">Testo</p>
          <textarea value={l.text} onChange={(e) => A.updateLayer(l.id, (x) => ({ ...x, text: e.target.value, name: e.target.value.slice(0, 30) || x.name }), "Testo", "txt" + l.id)} onKeyDown={(e) => e.stopPropagation()} rows={2} className="mb-2 w-full rounded border border-[#3e3e3e] bg-[#151515] p-1.5 text-[12px] text-white outline-none focus:border-[#2680eb]" />
          <TextControls style={l.textStyle} onChange={(s, key) => A.updateLayer(l.id, (x) => ({ ...x, textStyle: s }), "Carattere", key && l.id + key)} />
        </>
      )}
      {l.type === "solid" && (
        <div className="flex h-[24px] items-center justify-between text-[12px]">
          <span className="text-[#bdbdbd]">Colore</span>
          <input type="color" value={l.color} onChange={(e) => A.updateLayer(l.id, (x) => ({ ...x, color: e.target.value }), "Colore tinta unita", "col" + l.id)} className="h-5 w-8 cursor-pointer border border-[#4a4a4a] bg-transparent p-0" />
        </div>
      )}
    </div>
  );
}

export function AeCharacter() {
  const st = useAe();
  const comp = compOf(st);
  const l = comp?.layers.find((x) => st.selected.includes(x.id) && x.type === "text");
  if (!l || !l.textStyle) return <div className="grid h-full place-items-center px-6 text-center text-[12px] text-[#8a8a8a]">Seleziona un livello di testo</div>;
  return (
    <div className="h-full overflow-y-auto p-3">
      <TextControls style={l.textStyle} onChange={(s, key) => A.updateLayer(l.id, (x) => ({ ...x, textStyle: s }), "Carattere", key && l.id + key)} />
    </div>
  );
}

export function AeAlign() {
  const st = useAe();
  const comp = compOf(st);
  const t = timeOf(st);
  const align = (fn: (pos: number[], c: { w: number; h: number }) => number[]) =>
    st.commitComp((x) => ({ ...x, layers: x.layers.map((l) => (st.selected.includes(l.id) ? { ...l, transform: { ...l.transform, position: setAt(l.transform.position, fn(valueAt(l.transform.position, t), { w: x.width, h: x.height }), t, x.fps) } } : l)) }), "Allinea");
  if (!comp) return null;
  const btn = (title: string, icon: ReactNode, fn: (p: number[], c: { w: number; h: number }) => number[]) => (
    <button type="button" title={title} onClick={() => align(fn)} className="grid h-8 w-8 place-items-center rounded bg-[#2a2a2a] text-[#d0d0d0] hover:bg-[#3a3a3a]">
      {icon}
    </button>
  );
  return (
    <div className="space-y-3 p-3 text-[12px]">
      <p className="text-[#9a9a9a]">Allinea livelli a: Composizione</p>
      <div className="flex gap-1.5">
        {btn("Allinea a sinistra", <AlignStartVertical size={15} />, (p) => [0, ...p.slice(1)])}
        {btn("Centra orizzontalmente", <AlignCenterVertical size={15} />, (p, c) => [c.w / 2, ...p.slice(1)])}
        {btn("Allinea a destra", <AlignEndVertical size={15} />, (p, c) => [c.w, ...p.slice(1)])}
        {btn("Allinea in alto", <AlignStartHorizontal size={15} />, (p) => [p[0], 0, ...p.slice(2)])}
        {btn("Centra verticalmente", <AlignCenterHorizontal size={15} />, (p, c) => [p[0], c.h / 2, ...p.slice(2)])}
        {btn("Allinea in basso", <AlignEndHorizontal size={15} />, (p, c) => [p[0], c.h, ...p.slice(2)])}
      </div>
      <p className="text-[11px] text-[#7a7a7a]">Seleziona uno o più livelli: il loro punto di ancoraggio viene allineato alla composizione.</p>
    </div>
  );
}

export function AeTracker() {
  return <div className="grid h-full place-items-center px-6 text-center text-[12px] text-[#8a8a8a]">Il tracciatore di movimento analizza il video pixel per pixel e non è disponibile nel simulatore. Prova invece a animare la Posizione con i fotogrammi chiave.</div>;
}
