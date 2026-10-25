"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useHydrated } from "@/lib/hooks/useHydrated";
import {
  addEditAll,
  clipEnd,
  closeGap,
  deleteClips,
  emptySequence,
  getMedia,
  isVideo,
  linked,
  placeMedia,
  razor,
  seqDuration,
  usePremiere,
} from "@/lib/studio/premiere";
import { SequenceDialog } from "@/components/premiere/SequenceDialog";
import { ExportDialog } from "@/components/premiere/ExportDialog";
import { KeysHelp, MenuBar, Modal, Panel, Toast, typing, usePlayback, useWide, type Menu } from "../chrome";
import { AudioMeters, ProgramMonitor, SourceMonitor } from "./Monitors";
import { EffectControls, EffectsPanel, ProjectPanel, ToolsPanel } from "./Panels";
import { Timeline } from "./Timeline";

const KEYS: [string, string][] = [
  ["Spazio", "Riproduci / interrompi"],
  ["J · K · L", "Indietro · stop · avanti"],
  ["← / →", "Fotogramma precedente / successivo"],
  ["↑ / ↓", "Punto di modifica precedente / successivo"],
  ["Home / Fine", "Inizio / fine sequenza"],
  ["V", "Strumento Selezione"],
  ["B", "Strumento Modifica con increspatura"],
  ["C", "Strumento Lama"],
  ["H", "Strumento Mano"],
  ["Ctrl+K", "Aggiungi modifica (taglia sotto l'indicatore)"],
  ["Ctrl+Maiusc+K", "Aggiungi modifica a tutte le tracce"],
  ["Ctrl+D", "Applica transizione video predefinita"],
  ["Canc", "Elimina (lascia uno spazio)"],
  ["Maiusc+Canc", "Elimina con increspatura"],
  ["I / O", "Attacco / uscita nel monitor sorgente"],
  [", / .", "Inserisci / sovrascrivi dal monitor sorgente"],
  ["M", "Aggiungi marcatore"],
  ["S", "Aggancia (calamita)"],
  ["+ / −", "Ingrandisci / riduci la timeline"],
  ["\\", "Adatta la sequenza alla finestra"],
  ["Ctrl+Z / Ctrl+Maiusc+Z", "Annulla / ripeti"],
  ["Ctrl+A", "Seleziona tutto"],
  ["Ctrl+N", "Nuova sequenza"],
  ["Ctrl+M", "Esporta media"],
];

const WORKSPACES = ["Montaggio", "Assemblaggio", "Colore", "Effetti", "Audio", "Grafica"] as const;

/** Solo lato client: il simulatore usa tastiera, misure dello schermo e numeri calcolati al volo. */
export function PremiereStudio() {
  const hydrated = useHydrated();
  return hydrated ? <PremiereStudioInner /> : <div className="fixed inset-0 bg-[#161616]" />;
}

function PremiereStudioInner() {
  const st = usePremiere();
  const wide = useWide();
  const [workspace, setWorkspace] = useState<(typeof WORKSPACES)[number]>("Montaggio");
  const [topLeft, setTopLeft] = useState<"Sorgente" | "Controlli effetti">("Controlli effetti");
  const [bottomLeft, setBottomLeft] = useState<"Progetto" | "Effetti">("Progetto");
  const [mobileTab, setMobileTab] = useState<"Programma" | "Sorgente" | "Controlli effetti" | "Progetto" | "Effetti">("Programma");

  usePlayback(st.playing, (dt) => {
    const s = usePremiere.getState();
    const end = seqDuration(s.seq);
    const t = s.playhead + dt * (s.playing ? 1 : 0);
    if (t >= end) s.set({ playhead: end, playing: false });
    else s.set({ playhead: t });
  });

  // ---- azioni (usate da menu e scorciatoie) ----
  const actions = {
    deleteSel: (ripple: boolean) => {
      const s = usePremiere.getState();
      if (s.gap) {
        const next = closeGap(s.seq, s.gap.from, s.gap.to);
        if (!next) return s.notify("Impossibile chiudere lo spazio: ci sono clip in altre tracce in quel punto");
        return s.commit(next, []);
      }
      if (s.selection.length) s.commit(deleteClips(s.seq, s.selection, ripple), []);
    },
    addEdit: (all: boolean) => {
      const s = usePremiere.getState();
      if (all) return s.commit(addEditAll(s.seq, s.playhead));
      // senza Maiusc taglia solo le tracce di destinazione
      const ids = s.seq.clips
        .filter((c) => (c.track === s.targetV || c.track === s.targetA) && s.playhead > c.start && s.playhead < clipEnd(c))
        .flatMap((c) => linked(s.seq, c.id).map((k) => k.id));
      if (!ids.length) return s.notify("Nessuna clip sotto l'indicatore nelle tracce di destinazione");
      s.commit(razor(s.seq, ids, s.playhead));
    },
    transition: () => {
      const s = usePremiere.getState();
      let target = s.seq.clips.filter((c) => s.selection.includes(c.id) && isVideo(c.track));
      if (!target.length) {
        // altrimenti il punto di modifica più vicino sulla traccia di destinazione
        const near = s.seq.clips.filter((c) => c.track === s.targetV).sort((a, b) => Math.abs(a.start - s.playhead) - Math.abs(b.start - s.playhead))[0];
        target = near ? [near] : [];
      }
      if (!target.length) return s.notify("Seleziona una clip video");
      const ids = new Set(target.map((c) => c.id));
      s.commit({ ...s.seq, clips: s.seq.clips.map((c) => (ids.has(c.id) ? { ...c, transition: "dissolve" } : c)) });
      s.notify("Dissolvenza incrociata applicata");
    },
    place: (mode: "insert" | "overwrite") => {
      const s = usePremiere.getState();
      if (!s.selectedMedia) return;
      const m = getMedia(s.selectedMedia);
      const a = s.source.in ?? 0;
      const b = s.source.out ?? m.duration;
      if (b <= a) return s.notify("Il punto di uscita deve venire dopo l'attacco");
      const r = placeMedia(s.seq, m, s.playhead, a, b, mode, s.targetV, s.targetA);
      s.commit(r.seq, r.ids);
      s.setPlayhead(s.playhead + (b - a));
    },
    marker: () => {
      const s = usePremiere.getState();
      s.commit({ ...s.seq, markers: [...s.seq.markers, s.playhead] });
    },
    zoom: (f: number) => {
      const s = usePremiere.getState();
      s.set({ pxPerSec: Math.max(6, Math.min(200, s.pxPerSec * f)) });
    },
    fit: () => {
      const s = usePremiere.getState();
      const w = (document.querySelector("[data-timeline]")?.clientWidth ?? 900) - 120;
      s.set({ pxPerSec: Math.max(6, Math.min(200, w / Math.max(5, seqDuration(s.seq)))) });
    },
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = usePremiere.getState();
      if (typing(e) || (s.dialog && s.dialog !== "keys")) return;
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const frame = 1 / s.seq.fps;
      const edits = [...new Set(s.seq.clips.flatMap((c) => [c.start, clipEnd(c)]))].sort((a, b) => a - b);
      let handled = true;
      if (ctrl && k === "z") e.shiftKey ? s.redo() : s.undo();
      else if (ctrl && k === "y") s.redo();
      else if (ctrl && k === "k") actions.addEdit(e.shiftKey);
      else if (ctrl && k === "d") actions.transition();
      else if (ctrl && k === "a") s.set({ selection: s.seq.clips.map((c) => c.id) });
      else if (ctrl && k === "n") s.set({ dialog: "sequence" });
      else if (ctrl && k === "m") s.set({ dialog: "export" });
      else if (ctrl) handled = false;
      else if (k === " ") s.togglePlay();
      else if (k === "k") s.set({ playing: false });
      else if (k === "l") s.playing || s.togglePlay();
      else if (k === "j") s.set({ playing: false, playhead: Math.max(0, s.playhead - 1) });
      else if (k === "arrowleft") s.set({ playing: false, playhead: Math.max(0, s.playhead - frame * (e.shiftKey ? 5 : 1)) });
      else if (k === "arrowright") s.set({ playing: false, playhead: s.playhead + frame * (e.shiftKey ? 5 : 1) });
      else if (k === "arrowup") s.setPlayhead([...edits].reverse().find((x) => x < s.playhead - 0.001) ?? 0);
      else if (k === "arrowdown") s.setPlayhead(edits.find((x) => x > s.playhead + 0.001) ?? s.playhead);
      else if (k === "home") s.setPlayhead(0);
      else if (k === "end") s.setPlayhead(seqDuration(s.seq));
      else if (k === "v") s.set({ tool: "select" });
      else if (k === "b") s.set({ tool: "ripple" });
      else if (k === "c") s.set({ tool: "razor" });
      else if (k === "h") s.set({ tool: "hand" });
      else if (k === "s") s.set({ snapping: !s.snapping });
      else if (k === "m") actions.marker();
      else if (k === "i") s.set({ source: { ...s.source, in: s.source.t } });
      else if (k === "o") s.set({ source: { ...s.source, out: s.source.t } });
      else if (k === ",") actions.place("insert");
      else if (k === ".") actions.place("overwrite");
      else if (k === "delete" || k === "backspace") actions.deleteSel(e.shiftKey);
      else if (k === "+" || k === "=") actions.zoom(1.4);
      else if (k === "-") actions.zoom(1 / 1.4);
      else if (k === "\\") actions.fit();
      else if (k === "escape") s.set({ selection: [], gap: null, dialog: null });
      else handled = false;
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menus: Menu[] = [
    {
      label: "File",
      items: [
        { label: "Nuovo › Sequenza…", keys: "Ctrl+N", action: () => st.set({ dialog: "sequence" }) },
        "-",
        { label: "Esporta › Media…", keys: "Ctrl+M", action: () => st.set({ dialog: "export" }) },
        "-",
        { label: "Ripristina progetto di esempio", action: () => st.reset() },
      ],
    },
    {
      label: "Modifica",
      items: [
        { label: "Annulla", keys: "Ctrl+Z", action: st.undo, disabled: !st.past.length },
        { label: "Ripeti", keys: "Ctrl+Maiusc+Z", action: st.redo, disabled: !st.future.length },
        "-",
        { label: "Elimina", keys: "Canc", action: () => actions.deleteSel(false) },
        { label: "Elimina con increspatura", keys: "Maiusc+Canc", action: () => actions.deleteSel(true) },
        "-",
        { label: "Seleziona tutto", keys: "Ctrl+A", action: () => st.set({ selection: st.seq.clips.map((c) => c.id) }) },
        { label: "Deseleziona tutto", keys: "Esc", action: () => st.select(null) },
      ],
    },
    {
      label: "Clip",
      items: [
        { label: "Inserisci", keys: ",", action: () => actions.place("insert") },
        { label: "Sovrascrivi", keys: ".", action: () => actions.place("overwrite") },
      ],
    },
    {
      label: "Sequenza",
      items: [
        { label: "Aggiungi modifica", keys: "Ctrl+K", action: () => actions.addEdit(false) },
        { label: "Aggiungi modifica a tutte le tracce", keys: "Ctrl+Maiusc+K", action: () => actions.addEdit(true) },
        { label: "Applica transizione video", keys: "Ctrl+D", action: actions.transition },
        "-",
        { label: "Ingrandisci", keys: "+", action: () => actions.zoom(1.4) },
        { label: "Riduci", keys: "−", action: () => actions.zoom(1 / 1.4) },
        { label: st.snapping ? "✓ Aggancia nella timeline" : "Aggancia nella timeline", keys: "S", action: () => st.set({ snapping: !st.snapping }) },
      ],
    },
    { label: "Marcatori", items: [{ label: "Aggiungi marcatore", keys: "M", action: actions.marker }, { label: "Cancella tutti i marcatori", action: () => st.commit({ ...st.seq, markers: [] }) }] },
    { label: "Finestra", items: WORKSPACES.map((w) => ({ label: `Aree di lavoro › ${w}`, action: () => setWorkspace(w) })) },
    { label: "Aiuto", items: [{ label: "Scorciatoie da tastiera…", action: () => st.set({ dialog: "keys" }) }] },
  ];

  const timelinePanel = (
    <Panel tabs={[st.seq.name]} tab={st.seq.name} className="h-full" focused>
      <div data-timeline className="absolute inset-0">
        <Timeline />
      </div>
    </Panel>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-[#161616] text-[#c8c8c8]">
      <MenuBar app="Pr" color="#9999ff" menus={menus} right={<span className="hidden text-[11px] text-[#7a7a7a] md:inline">Progetto.prproj — SqueakEdit</span>} />
      <div className="flex h-8 shrink-0 items-center justify-center gap-4 overflow-x-auto border-b border-black bg-[#1b1b1b] px-3 text-[12px]">
        {WORKSPACES.map((w) => (
          <button key={w} type="button" onClick={() => setWorkspace(w)} className={clsx("whitespace-nowrap pb-0.5", w === workspace ? "border-b-2 border-[#2680eb] text-white" : "text-[#8f8f8f] hover:text-white")}>
            {w}
          </button>
        ))}
      </div>

      {/* schermo largo: la classica area di lavoro Montaggio */}
      {wide ? (
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-1 p-1">
        <Panel tabs={["Sorgente", "Controlli effetti"] as const} tab={topLeft} onTab={setTopLeft}>
          {topLeft === "Sorgente" ? <SourceMonitor /> : <EffectControls />}
        </Panel>
        <Panel tabs={["Programma: " + st.seq.name]} tab={"Programma: " + st.seq.name}>
          <ProgramMonitor />
        </Panel>
        <div className="col-span-2 grid min-h-0 grid-cols-[minmax(220px,0.8fr)_auto_minmax(0,3fr)_auto] gap-1">
          <Panel tabs={["Progetto", "Effetti"] as const} tab={bottomLeft} onTab={setBottomLeft}>
            {bottomLeft === "Progetto" ? <ProjectPanel /> : <EffectsPanel />}
          </Panel>
          <div className="rounded-[6px] border border-[#151515] bg-[#232323]">
            <ToolsPanel />
          </div>
          {timelinePanel}
          <div className="w-10 rounded-[6px] border border-[#151515] bg-[#232323]">
            <AudioMeters />
          </div>
        </div>
      </div>

      ) : (
      /* telefono e tablet: pannelli impilati */
      <div className="flex min-h-0 flex-1 flex-col gap-1 p-1">
        <Panel
          tabs={["Programma", "Sorgente", "Controlli effetti", "Progetto", "Effetti"] as const}
          tab={mobileTab}
          onTab={setMobileTab}
          className="h-[45%] shrink-0"
        >
          {mobileTab === "Programma" && <ProgramMonitor />}
          {mobileTab === "Sorgente" && <SourceMonitor />}
          {mobileTab === "Controlli effetti" && <EffectControls />}
          {mobileTab === "Progetto" && <ProjectPanel />}
          {mobileTab === "Effetti" && <EffectsPanel />}
        </Panel>
        <div className="flex shrink-0 items-center rounded-[6px] border border-[#151515] bg-[#232323]">
          <ToolsPanel horizontal />
          <button type="button" onClick={() => actions.addEdit(true)} className="ml-auto rounded px-2 py-1 text-[11px] font-semibold text-[#cfcfcf] hover:bg-white/10">
            Taglia qui
          </button>
          <button type="button" onClick={() => actions.deleteSel(true)} className="rounded px-2 py-1 text-[11px] font-semibold text-[#cfcfcf] hover:bg-white/10">
            Elimina
          </button>
          <button type="button" onClick={st.undo} className="rounded px-2 py-1 text-[11px] font-semibold text-[#cfcfcf] hover:bg-white/10">
            Annulla
          </button>
        </div>
        <div className="min-h-0 flex-1">{timelinePanel}</div>
      </div>
      )}

      {st.dialog === "sequence" && (
        <Modal onClose={() => st.set({ dialog: null })}>
          <SequenceDialog
            initialName={`Sequenza 0${Math.min(9, st.past.length % 9 + 2)}`}
            onCancel={() => st.set({ dialog: null })}
            onConfirm={(s) => {
              st.commit(emptySequence(s.name, s.width, s.height, s.fps), []);
              st.set({ dialog: null, playhead: 0 });
              st.notify(`Creata "${s.name}" (${s.width}×${s.height}, ${String(s.fps).replace(".", ",")} fps). Ctrl+Z per tornare indietro`);
            }}
          />
        </Modal>
      )}
      {st.dialog === "export" && (
        <Modal wide onClose={() => st.set({ dialog: null })}>
          <ExportDialog
            fileName={st.seq.name}
            source={{ width: st.seq.width, height: st.seq.height, fps: st.seq.fps, seconds: Math.max(1, seqDuration(st.seq)) }}
            onCancel={() => st.set({ dialog: null })}
            onExport={(s) => {
              if (!st.seq.clips.length) {
                st.notify("La sequenza è vuota: aggiungi qualche clip prima di esportare");
                return false;
              }
              setTimeout(() => {
                usePremiere.getState().set({ dialog: null });
                usePremiere.getState().notify(`Esportazione completata: ${s.width}×${s.height} ${s.format}, ${s.bitrateMbps} Mbps`);
              }, 1800);
              return true;
            }}
          />
        </Modal>
      )}
      {st.dialog === "keys" && <KeysHelp title="Scorciatoie da tastiera — Premiere Pro" rows={KEYS} onClose={() => st.set({ dialog: null })} />}
      <Toast text={st.toast} />
    </div>
  );
}
