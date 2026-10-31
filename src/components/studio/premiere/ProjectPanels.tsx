"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ChevronDown, ChevronRight, Clapperboard, FilePlus2, Folder, FolderOpen, FolderPlus, Grid2x2, LayoutPanelTop, List, ListOrdered, Music, Search, Sparkles, SplitSquareHorizontal, Trash2, Type, Video, Image as ImageIcon, HardDrive } from "lucide-react";
import { prop, uid } from "@/lib/studio/anim";
import { EFFECTS, EFFECT_CATEGORIES, TRANSITIONS, TRANSITION_CATEGORIES, newEffect } from "@/lib/studio/effects";
import { SAMPLE_LIBRARY, isStill, type Media } from "@/lib/studio/media";
import { LABELS, clipDur, playheadOf, seqOf, usePremiere, type MenuItemLike, type ProjectItem } from "@/lib/studio/premiere";
import { timecode } from "../chrome";
import { Thumb } from "../render";
import * as A from "./actions";

export const openImport = () => document.getElementById("pr-import-input")?.click();

const newItemMenu = (): MenuItemLike[] => [
  { label: "Sequenza…", keys: "Ctrl+N", action: () => usePremiere.getState().set({ dialog: { type: "sequence" } }) },
  "-",
  { label: "Video nero", action: () => A.newSyntheticItem("black") },
  { label: "Livello di regolazione", action: () => A.newSyntheticItem("adjustment") },
  { label: "Barre e tono HD", action: () => A.newSyntheticItem("bars") },
  { label: "Mascherino colore…", action: () => usePremiere.getState().set({ dialog: { type: "matte" } }) },
  { label: "Contatore universale", action: () => A.newSyntheticItem("countdown") },
];

function ItemIcon({ it, media }: { it: ProjectItem; media?: Media }) {
  if (it.type === "bin") return <Folder size={14} className="text-[#e8a23a]" />;
  if (it.type === "sequence") return <Clapperboard size={14} className="text-[#a59ee6]" />;
  if (media?.kind === "audio") return <Music size={14} className="text-[#4fbf5a]" />;
  if (media?.kind === "image") return <ImageIcon size={14} className="text-[#c45d9b]" />;
  return <Video size={14} className="text-[#3d9cf0]" />;
}

function HoverThumb({ media }: { media: Media }) {
  const [t, setT] = useState(1);
  return (
    <div
      className="relative h-full w-full"
      onPointerMove={(e) => {
        if (isStill(media)) return;
        const r = e.currentTarget.getBoundingClientRect();
        setT(((e.clientX - r.left) / r.width) * media.duration);
      }}
      onPointerLeave={() => setT(1)}
    >
      {media.kind === "audio" ? (
        <div className="grid h-full w-full place-items-center bg-[#173323]">
          <Music size={26} className="text-[#4fbf5a]" />
        </div>
      ) : (
        <Thumb media={media} t={t} />
      )}
      {!isStill(media) && t !== 1 && <div className="absolute inset-y-0 w-px bg-[#3d9cf0]" style={{ left: `${(t / media.duration) * 100}%` }} />}
    </div>
  );
}

export function ProjectPanel() {
  const st = usePremiere();
  const { project, bin, projectView, projectSel, search } = st;
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const items = project.items.filter((i) => (search ? i.name.toLowerCase().includes(search.toLowerCase()) : i.parent === bin));
  const binItem = bin ? project.items.find((i) => i.id === bin) : null;
  const count = (id: string) => project.items.filter((i) => i.parent === id).length;

  const open = (it: ProjectItem) => {
    if (it.type === "bin") return st.set({ bin: it.id, projectSel: [], search: "" });
    if (it.type === "sequence") return st.openSequence(it.ref!);
    st.set({ source: { mediaId: it.ref!, t: 0, in: null, out: null, playing: false }, focus: "source" });
  };
  const select = (e: React.MouseEvent, it: ProjectItem) => {
    if (e.ctrlKey || e.metaKey) st.set({ projectSel: projectSel.includes(it.id) ? projectSel.filter((x) => x !== it.id) : [...projectSel, it.id] });
    else if (e.shiftKey && projectSel.length) {
      const a = items.findIndex((i) => i.id === projectSel[0]);
      const b = items.findIndex((i) => i.id === it.id);
      st.set({ projectSel: items.slice(Math.min(a, b), Math.max(a, b) + 1).map((i) => i.id) });
    } else st.set({ projectSel: [it.id] });
  };
  const itemMenu = (e: React.MouseEvent, it?: ProjectItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (it && !projectSel.includes(it.id)) st.set({ projectSel: [it.id] });
    const sel = it ? (projectSel.includes(it.id) ? projectSel : [it.id]) : [];
    const media = it?.type === "media" ? project.media[it.ref!] : undefined;
    const items: MenuItemLike[] = it
      ? [
          { label: "Rinomina", action: () => st.set({ dialog: { type: "rename", title: "Rinomina", value: it.name, onOk: (v) => A.renameItem(it.id, v) } }) },
          { label: "Cancella", keys: "Canc", action: () => A.deleteProjectItems(sel) },
          "-",
          ...(it.type === "media"
            ? ([
                { label: "Apri nel monitor sorgente", action: () => open(it) },
                { label: "Nuova sequenza da clip", action: () => A.sequenceFromMedia(it.ref!) },
              ] as MenuItemLike[])
            : it.type === "sequence"
              ? ([
                  { label: "Apri nella timeline", action: () => open(it) },
                  {
                    label: "Duplica",
                    action: () => {
                      const q = project.sequences[it.ref!];
                      const id = uid("seq");
                      st.commit((p) => ({ ...p, sequences: { ...p.sequences, [id]: { ...q, id, name: q.name + " Copia" } }, items: [...p.items, { ...it, id: uid("it"), ref: id, name: q.name + " Copia" }] }), "Duplica sequenza");
                    },
                  },
                ] as MenuItemLike[])
              : ([{ label: "Apri raccoglitore", action: () => open(it) }] as MenuItemLike[])),
          "-",
          { label: "Etichetta", sub: LABELS.map(([n], i) => ({ label: n, checked: it.label === i, action: () => st.commit((p) => ({ ...p, items: p.items.map((x) => (sel.includes(x.id) ? { ...x, label: i } : x)) }), "Etichetta") })) },
          ...(media ? ([{ label: "Proprietà", action: () => st.set({ focus: "metadata" }) }] as MenuItemLike[]) : []),
        ]
      : [
          { label: "Incolla", disabled: true },
          "-",
          { label: "Nuovo raccoglitore", keys: "Ctrl+/", action: A.newBin },
          { label: "Nuovo elemento", sub: newItemMenu() },
          "-",
          { label: "Importa…", keys: "Ctrl+I", action: openImport },
          { label: "Trova…", action: () => document.getElementById("pr-project-search")?.focus() },
        ];
    st.set({ menu: { x: e.clientX, y: e.clientY, items } });
  };
  const dropOn = (e: React.DragEvent, target: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    if (e.dataTransfer.files?.length) return void A.importFiles(e.dataTransfer.files);
    const id = e.dataTransfer.getData("text/x-item");
    if (id) A.moveItems(projectSel.includes(id) ? projectSel : [id], target);
  };

  return (
    <div className="flex h-full flex-col" onContextMenu={(e) => itemMenu(e)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => dropOn(e, bin)}>
      <div className="flex shrink-0 items-center gap-2 px-3 pb-1 text-[12px] text-[#d0d0d0]">
        {bin ? (
          <button type="button" onClick={() => st.set({ bin: binItem?.parent ?? null })} className="flex items-center gap-1.5 hover:text-white" title="Torna su">
            <ArrowLeft size={13} /> <FolderOpen size={13} className="text-[#e8a23a]" /> {binItem?.name}
          </button>
        ) : (
          <span className="flex items-center gap-2">
            <LayoutPanelTop size={13} className="text-[#9a9a9a]" /> {project.name}.prproj
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 px-3 pb-2">
        <label className="flex h-7 flex-1 items-center gap-1.5 rounded-full border border-[#3a3a3a] bg-[#151515] px-2.5 text-[12px]">
          <Search size={13} className="text-[#8a8a8a]" />
          <input id="pr-project-search" value={search} onChange={(e) => st.set({ search: e.target.value })} onKeyDown={(e) => e.stopPropagation()} placeholder="Cerca" className="min-w-0 flex-1 bg-transparent text-[#e0e0e0] outline-none placeholder:text-[#7a7a7a]" />
        </label>
        <span className="whitespace-nowrap text-[11.5px] text-[#9a9a9a]">{items.length} elementi</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2" onPointerDown={(e) => e.target === e.currentTarget && st.set({ projectSel: [] })}>
        {projectView === "icon" ? (
          <div className="grid gap-3 pb-3" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${Math.round(112 * zoom)}px, 1fr))` }}>
            {items.map((it) => {
              const media = it.type === "media" ? project.media[it.ref!] : undefined;
              const q = it.type === "sequence" ? project.sequences[it.ref!] : undefined;
              const sel = projectSel.includes(it.id);
              return (
                <div
                  key={it.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/x-item", it.id);
                    e.dataTransfer.effectAllowed = "copyMove";
                  }}
                  onDragOver={(e) => it.type === "bin" && (e.preventDefault(), setDragOver(it.id))}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => it.type === "bin" && dropOn(e, it.id)}
                  onClick={(e) => select(e, it)}
                  onDoubleClick={() => open(it)}
                  onContextMenu={(e) => itemMenu(e, it)}
                  className="cursor-default"
                >
                  <div
                    className={clsx("relative aspect-video overflow-hidden rounded-[3px]", it.type === "bin" ? "grid place-items-center bg-[#262626]" : "bg-black", sel && "outline outline-2 outline-[#2d8ceb]", dragOver === it.id && "outline outline-2 outline-[#e8a23a]")}
                  >
                    {it.type === "bin" ? (
                      <Folder size={34} strokeWidth={1.6} className="text-[#e8a23a]" />
                    ) : media ? (
                      <HoverThumb media={media} />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-[#26233d]">
                        <Clapperboard size={26} className="text-[#a59ee6]" />
                      </div>
                    )}
                    {media && !isStill(media) && <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 font-mono text-[9.5px] text-white">{timecode(media.duration, media.fps).slice(3)}</span>}
                    {q && <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 font-mono text-[9.5px] text-white">{q.width}×{q.height}</span>}
                    <span className="absolute bottom-0 left-0 h-[3px] w-full" style={{ background: LABELS[it.label]?.[1] }} />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-1 text-[12px]">
                    <span className={clsx("truncate", sel ? "text-white" : "text-[#d6d6d6]")}>{it.name}</span>
                    {it.type === "bin" && <span className="shrink-0 text-[11px] text-[#8a8a8a]">{count(it.id)} elementi</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-[#1e1e1e] text-left text-[11px] text-[#9a9a9a]">
              <tr>
                <th className="py-1 pl-1 font-normal">Nome</th>
                <th className="font-normal">Frequenza fotogrammi</th>
                <th className="font-normal">Inizio supporto</th>
                <th className="font-normal">Durata supporto</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const media = it.type === "media" ? project.media[it.ref!] : undefined;
                const q = it.type === "sequence" ? project.sequences[it.ref!] : undefined;
                const sel = projectSel.includes(it.id);
                return (
                  <tr
                    key={it.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/x-item", it.id)}
                    onDragOver={(e) => it.type === "bin" && e.preventDefault()}
                    onDrop={(e) => it.type === "bin" && dropOn(e, it.id)}
                    onClick={(e) => select(e, it)}
                    onDoubleClick={() => open(it)}
                    onContextMenu={(e) => itemMenu(e, it)}
                    className={clsx("h-6", sel ? "bg-[#2d63d6]/60 text-white" : "text-[#d6d6d6] hover:bg-white/5")}
                  >
                    <td className="flex items-center gap-1.5 pl-1">
                      <span className="h-3 w-1 rounded-sm" style={{ background: LABELS[it.label]?.[1] }} />
                      <ItemIcon it={it} media={media} />
                      <span className="truncate">{it.name}</span>
                      {it.type === "bin" && <span className="text-[#8a8a8a]">({count(it.id)})</span>}
                    </td>
                    <td>{media ? `${media.fps} fps` : q ? `${q.fps} fps` : ""}</td>
                    <td className="font-mono">{media || q ? "00:00:00:00" : ""}</td>
                    <td className="font-mono">{media ? timecode(media.duration, media.fps) : q ? timecode(Math.max(0, ...q.clips.map((c) => c.start + clipDur(c))), q.fps) : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!items.length && (
          <div className="grid h-40 place-items-center text-center text-[12px] text-[#7a7a7a]">
            {search ? "Nessun risultato" : "Raccoglitore vuoto. Importa dei file (Ctrl+I) o trascinali qui dal computer."}
          </div>
        )}
      </div>
      <div className="flex h-8 shrink-0 items-center gap-1 px-2 text-[#bdbdbd]">
        <button type="button" title="Vista elenco" onClick={() => st.set({ projectView: "list" })} className={clsx("grid h-6 w-7 place-items-center rounded", projectView === "list" ? "bg-[#3a3a3a] text-white" : "hover:bg-white/10")}>
          <List size={14} />
        </button>
        <button type="button" title="Vista icone" onClick={() => st.set({ projectView: "icon" })} className={clsx("grid h-6 w-7 place-items-center rounded", projectView === "icon" ? "bg-[#3a3a3a] text-white" : "hover:bg-white/10")}>
          <Grid2x2 size={14} />
        </button>
        <input type="range" min={0.6} max={2} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mx-2 h-1 w-24 accent-[#d0d0d0]" aria-label="Dimensione miniature" />
        <span className="ml-auto" />
        <button
          type="button"
          title="Ordina icone"
          onClick={() => st.commit((p) => ({ ...p, items: [...p.items].sort((a, b) => (a.type === "bin" ? -1 : b.type === "bin" ? 1 : a.name.localeCompare(b.name))) }), "Ordina")}
          className="grid h-6 w-7 place-items-center rounded hover:bg-white/10"
        >
          <ListOrdered size={14} />
        </button>
        <button type="button" title="Trova" onClick={() => document.getElementById("pr-project-search")?.focus()} className="grid h-6 w-7 place-items-center rounded hover:bg-white/10">
          <Search size={14} />
        </button>
        <button type="button" title="Nuovo raccoglitore (Ctrl+/)" onClick={A.newBin} className="grid h-6 w-7 place-items-center rounded hover:bg-white/10">
          <FolderPlus size={14} />
        </button>
        <button
          type="button"
          title="Nuovo elemento (trascina qui una clip per creare una sequenza)"
          onClick={(e) => st.set({ menu: { x: e.clientX, y: e.clientY - 200, items: newItemMenu() } })}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = e.dataTransfer.getData("text/x-item");
            const it = project.items.find((i) => i.id === id);
            if (it?.type === "media") A.sequenceFromMedia(it.ref!);
          }}
          className="grid h-6 w-7 place-items-center rounded hover:bg-white/10"
        >
          <FilePlus2 size={14} />
        </button>
        <button type="button" title="Cancella" onClick={() => projectSel.length && A.deleteProjectItems(projectSel)} className="grid h-6 w-7 place-items-center rounded hover:bg-white/10">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function MediaBrowser() {
  const st = usePremiere();
  const [open, setOpen] = useState<Record<string, boolean>>({ Video: true, Audio: true, Grafica: true });
  return (
    <div className="flex h-full flex-col text-[12px]">
      <div className="flex shrink-0 items-center gap-2 px-3 pb-2">
        <button type="button" onClick={openImport} className="flex items-center gap-1.5 rounded-full bg-[#2680eb] px-3 py-1 font-semibold text-white hover:bg-[#1473e6]">
          <HardDrive size={13} /> Sfoglia il computer…
        </button>
        <span className="text-[11px] text-[#8a8a8a]">o trascina i file nel pannello Progetto</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <div className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#8a8a8a]">Libreria di esempio</div>
        {["Video", "Audio", "Grafica"].map((folder) => (
          <div key={folder}>
            <button type="button" onClick={() => setOpen({ ...open, [folder]: !open[folder] })} className="flex w-full items-center gap-1 px-1 py-1 text-[#d0d0d0]">
              {open[folder] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <Folder size={13} className="text-[#e8a23a]" /> {folder}
            </button>
            {open[folder] &&
              SAMPLE_LIBRARY.filter((m) => m.folder === folder).map((m) => {
                const imported = st.project.items.some((i) => i.ref === m.id);
                const { folder: _f, ...media } = m;
                void _f;
                return (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/x-sample", m.id)}
                    onDoubleClick={() => A.importSample(media)}
                    className="ml-5 flex items-center gap-2 rounded px-1 py-1 hover:bg-white/5"
                  >
                    <div className="relative h-7 w-12 shrink-0 overflow-hidden rounded-sm bg-black">
                      <Thumb media={media} />
                    </div>
                    <span className="flex-1 truncate text-[#d6d6d6]">{m.name}</span>
                    <button type="button" disabled={imported} onClick={() => A.importSample(media)} className="rounded px-2 py-0.5 text-[11px] text-[#3d9cf0] hover:bg-white/10 disabled:text-[#6a6a6a]">
                      {imported ? "Importato" : "Importa"}
                    </button>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Libraries() {
  return <div className="grid h-full place-items-center px-6 text-center text-[12px] text-[#8a8a8a]">Le librerie Creative Cloud richiedono un account Adobe e non sono disponibili nel simulatore.</div>;
}

export function InfoPanel() {
  const st = usePremiere();
  const seq = seqOf(st);
  const clip = seq?.clips.find((c) => st.selection.includes(c.id));
  const it = st.project.items.find((i) => st.projectSel.includes(i.id));
  return (
    <div className="space-y-3 overflow-y-auto p-3 text-[12px] text-[#d0d0d0]">
      {clip && seq ? (
        <div>
          <p className="font-semibold text-white">{clip.name}</p>
          <p>Tipo: clip {clip.track.startsWith("v") ? "video" : "audio"}</p>
          <p>Inizio: {timecode(clip.start, seq.fps)}</p>
          <p>Fine: {timecode(clip.start + clipDur(clip), seq.fps)}</p>
          <p>Durata: {timecode(clipDur(clip), seq.fps)}</p>
          <p>Velocità: {(clip.speed * 100).toFixed(0)}%</p>
        </div>
      ) : it ? (
        <p className="font-semibold text-white">{it.name}</p>
      ) : (
        <p className="text-[#8a8a8a]">Nessuna selezione</p>
      )}
      {seq && (
        <div className="border-t border-[#2a2a2a] pt-2">
          <p className="font-semibold text-white">{seq.name}</p>
          <p>
            {seq.width} × {seq.height} · {seq.fps} fps
          </p>
          <p>Indicatore: {timecode(playheadOf(st), seq.fps)}</p>
          <p>Clip: {seq.clips.length}</p>
        </div>
      )}
    </div>
  );
}

const PRESETS = [
  { id: "p-fadein", name: "Dissolvenza in entrata" },
  { id: "p-fadeout", name: "Dissolvenza in uscita" },
  { id: "p-zoom", name: "Zoom lento (Ken Burns)" },
  { id: "p-blurin", name: "Sfocatura in entrata" },
  { id: "p-pip", name: "Immagine nell'immagine in alto a destra" },
];

export function applyPreset(id: string, ids?: string[]) {
  const s = usePremiere.getState();
  const q = seqOf(s);
  const target = ids ?? s.selection;
  if (!q) return;
  const clips = q.clips.filter((c) => target.includes(c.id) && c.track.startsWith("v"));
  if (!clips.length) return s.notify("Seleziona una clip video");
  const k = (t: number, v: number[]) => ({ id: uid("k"), t, v, easeIn: false, easeOut: false, hold: false });
  s.commitSeq(
    (x) => ({
      ...x,
      clips: x.clips.map((c) => {
        if (!clips.some((y) => y.id === c.id)) return c;
        const d = clipDur(c);
        if (id === "p-fadein") return { ...c, opacity: { ...prop(100), keys: [k(0, [0]), k(1, [100])] } };
        if (id === "p-fadeout") return { ...c, opacity: { ...prop(100), keys: [k(Math.max(0, d - 1), [100]), k(d, [0])] } };
        if (id === "p-zoom") return { ...c, motion: { ...c.motion, scale: { ...prop(100), keys: [{ ...k(0, [100]), easeOut: true }, { ...k(d, [115]), easeIn: true }] } } };
        if (id === "p-blurin") {
          const fx = newEffect("gaussian", x.width, x.height);
          fx.params.blur = { ...fx.params.blur, keys: [k(0, [80]), k(1, [0])] };
          return { ...c, effects: [...c.effects, fx] };
        }
        return { ...c, motion: { ...c.motion, scale: prop(35), position: prop(x.width * 0.78, x.height * 0.24) } };
      }),
    }),
    "Applica predefinito",
  );
}

function TreeFolder({ name, children, depth = 0, defaultOpen = false, icon }: { name: string; children: React.ReactNode; depth?: number; defaultOpen?: boolean; icon?: React.ReactNode }) {
  const [o, setO] = useState(defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setO(!o)} className="flex w-full items-center gap-1 py-[3px] text-left text-[12px] text-[#d0d0d0] hover:bg-white/5" style={{ paddingLeft: depth * 14 + 4 }}>
        {o ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {icon ?? (o ? <FolderOpen size={13} className="text-[#e8a23a]" /> : <Folder size={13} className="text-[#e8a23a]" />)}
        {name}
      </button>
      {o && children}
    </div>
  );
}

function Leaf({ name, depth, onDrag, onApply, badge }: { name: string; depth: number; onDrag: (e: React.DragEvent) => void; onApply: () => void; badge?: string }) {
  return (
    <div
      draggable
      onDragStart={onDrag}
      onDoubleClick={onApply}
      title="Trascina su una clip, o selezionala e fai doppio clic"
      className="flex cursor-grab items-center gap-1.5 py-[3px] text-[12px] text-[#d6d6d6] hover:bg-white/5"
      style={{ paddingLeft: depth * 14 + 20 }}
    >
      {badge === "t" ? <SplitSquareHorizontal size={12} className="shrink-0 text-[#a59ee6]" /> : <Sparkles size={12} className="shrink-0 text-[#3d9cf0]" />}
      <span className="truncate">{name}</span>
    </div>
  );
}

export function EffectsPanel() {
  const st = usePremiere();
  const [q, setQ] = useState("");
  const match = (n: string) => !q || n.toLowerCase().includes(q.toLowerCase());
  const videoFx = EFFECTS.filter((e) => !e.audio && e.only !== "ae");
  const audioFx = EFFECTS.filter((e) => e.audio);
  const applyTrans = (id: string) => {
    const s = usePremiere.getState();
    const seq = seqOf(s);
    const sel = seq?.clips.filter((c) => s.selection.includes(c.id)) ?? [];
    if (!sel.length) return s.notify("Seleziona una clip");
    for (const c of sel) A.applyTransitionAt(id, c.id, "in");
  };
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-3 pb-2">
        <label className="flex h-7 items-center gap-1.5 rounded-full border border-[#3a3a3a] bg-[#151515] px-2.5 text-[12px]">
          <Search size={13} className="text-[#8a8a8a]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="Cerca effetti" className="min-w-0 flex-1 bg-transparent text-[#e0e0e0] outline-none placeholder:text-[#7a7a7a]" />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-3">
        {q ? (
          <>
            {[...videoFx, ...audioFx].filter((e) => match(e.name)).map((e) => (
              <Leaf key={e.id} name={e.name} depth={0} onDrag={(ev) => ev.dataTransfer.setData("text/x-fx", e.id)} onApply={() => A.applyEffect(e.id)} />
            ))}
            {TRANSITIONS.filter((t) => match(t.name)).map((t) => (
              <Leaf key={t.id} name={t.name} depth={0} badge="t" onDrag={(ev) => ev.dataTransfer.setData("text/x-trans", t.id)} onApply={() => applyTrans(t.id)} />
            ))}
          </>
        ) : (
          <>
            <TreeFolder name="Predefiniti">
              {PRESETS.map((p) => (
                <Leaf key={p.id} name={p.name} depth={1} onDrag={(ev) => ev.dataTransfer.setData("text/x-preset", p.id)} onApply={() => applyPreset(p.id)} />
              ))}
            </TreeFolder>
            <TreeFolder name="Effetti audio">
              {audioFx.map((e) => (
                <Leaf key={e.id} name={e.name} depth={1} onDrag={(ev) => ev.dataTransfer.setData("text/x-fx", e.id)} onApply={() => A.applyEffect(e.id)} />
              ))}
            </TreeFolder>
            <TreeFolder name="Transizioni audio">
              <TreeFolder name="Dissolvenza incrociata" depth={1}>
                {TRANSITIONS.filter((t) => t.audio).map((t) => (
                  <Leaf key={t.id} name={t.name} depth={2} badge="t" onDrag={(ev) => ev.dataTransfer.setData("text/x-trans", t.id)} onApply={() => applyTrans(t.id)} />
                ))}
              </TreeFolder>
            </TreeFolder>
            <TreeFolder name="Effetti video" defaultOpen>
              {EFFECT_CATEGORIES.filter((c) => videoFx.some((e) => e.category === c)).map((cat) => (
                <TreeFolder key={cat} name={cat} depth={1}>
                  {videoFx
                    .filter((e) => e.category === cat)
                    .map((e) => (
                      <Leaf key={e.id} name={e.name} depth={2} onDrag={(ev) => ev.dataTransfer.setData("text/x-fx", e.id)} onApply={() => A.applyEffect(e.id)} />
                    ))}
                </TreeFolder>
              ))}
            </TreeFolder>
            <TreeFolder name="Transizioni video" defaultOpen>
              {TRANSITION_CATEGORIES.map((cat) => (
                <TreeFolder key={cat} name={cat} depth={1} defaultOpen={cat === "Dissolvenza"}>
                  {TRANSITIONS.filter((t) => t.category === cat).map((t) => (
                    <Leaf key={t.id} name={t.name} depth={2} badge="t" onDrag={(ev) => ev.dataTransfer.setData("text/x-trans", t.id)} onApply={() => applyTrans(t.id)} />
                  ))}
                </TreeFolder>
              ))}
            </TreeFolder>
          </>
        )}
      </div>
      <div className="shrink-0 px-3 py-1.5 text-[11px] text-[#7a7a7a]">{st.selection.length ? `${st.selection.length} clip selezionate` : "Nessuna clip selezionata"}</div>
    </div>
  );
}

export function HistoryPanel() {
  const st = usePremiere();
  const rows = [{ label: "Apri progetto" }, ...st.past.map((p) => ({ label: p.label }))];
  const cur = st.past.length;
  return (
    <div className="h-full overflow-y-auto py-1 text-[12px]">
      {[...rows, ...st.future.map((f) => ({ label: f.label }))].map((r, i) => (
        <button
          key={i}
          type="button"
          onClick={() => st.jumpHistory(i)}
          className={clsx("flex w-full items-center gap-2 px-3 py-1 text-left", i === cur ? "bg-[#2d63d6]/60 text-white" : i > cur ? "text-[#6a6a6a] hover:bg-white/5" : "text-[#d0d0d0] hover:bg-white/5")}
        >
          <Type size={11} className="opacity-0" />
          {r.label}
        </button>
      ))}
    </div>
  );
}
