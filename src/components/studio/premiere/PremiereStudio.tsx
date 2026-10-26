"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Bell, Expand, Hand, Home, LayoutPanelLeft, MousePointer2, PenTool, Scissors, Search, Share, Type, Volume2, ZoomIn, Square, Circle, Moon } from "lucide-react";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { restoreFiles } from "@/lib/studio/media";
import { playheadOf, seqOf, usePremiere, type PanelId, type PrTool } from "@/lib/studio/premiere";
import { ContextMenu, Gutter, MenuBar, Panel, Toast, useWide, type Menu } from "../chrome";
import { CloseX, DockZone, DragGhost, useDockLayout, windowMenu, type Zones } from "../dock";
import type { MenuItemLike } from "@/lib/studio/premiere";
import { ProgramMonitor, SourceMonitor } from "./Monitors";
import { AudioMixer, EffectControls, EssentialGraphics, Metadata, PropertiesPanel, TextPanel } from "./Inspectors";
import { EffectsPanel, HistoryPanel, InfoPanel, Libraries, MediaBrowser, ProjectPanel, applyPreset, openImport } from "./ProjectPanels";
import { Timeline } from "./Timeline";
import { PremiereDialogs } from "./Dialogs";
import { handlePremiereKey } from "./keys";
import { meterLevels } from "./compose";
import * as A from "./actions";

// Simulatore di Premiere Pro: stessa disposizione dell'area di lavoro
// Modifica (Sorgente | Programma | Proprietà sopra, Progetto | Strumenti |
// Timeline | Indicatori audio sotto), menu, scorciatoie e modalità
// Importa / Modifica / Esporta.

const PANEL_LABEL: Record<string, string> = {
  source: "Sorgente",
  effectControls: "Controlli effetti",
  mixer: "Mixer clip audio",
  metadata: "Metadati",
  program: "Programma",
  properties: "Proprietà",
  graphics: "Grafica essenziale",
  text: "Testo",
  project: "Progetto",
  media: "Browser multimediale",
  libraries: "Librerie",
  info: "Info",
  effects: "Effetti",
  history: "Cronologia",
  timeline: "Timeline",
};
// solo i pannelli che servono davvero (niente browser multimediale, librerie,
// metadati, mixer e indicatori audio): gli altri si chiudono e riaprono da Finestra
const DESK_ZONES: Zones = {
  TL: { tabs: ["source", "effectControls"], active: "source" },
  TC: { tabs: ["program"], active: "program" },
  TR: { tabs: ["properties", "graphics"], active: "properties" },
  BL: { tabs: ["project", "effects", "history"], active: "project" },
  BR: { tabs: ["timeline"], active: "timeline" },
};
const DESK_PANELS = Object.values(DESK_ZONES).flatMap((z) => z.tabs);
const DESK_ZONE_NAMES = { TL: "In alto a sinistra", TC: "In alto al centro", TR: "In alto a destra", BL: "In basso a sinistra", BR: "In basso (timeline)" };
const PHONE_ZONES: Zones = {
  A: { tabs: ["program", "project", "effectControls", "source", "effects", "properties", "graphics", "history"], active: "program" },
  B: { tabs: ["timeline"], active: "timeline" },
};
const PHONE_PANELS = Object.values(PHONE_ZONES).flatMap((z) => z.tabs);
const PHONE_ZONE_NAMES = { A: "Pannello in alto", B: "Pannello in basso" };
const TL = ["Sorgente", "Controlli effetti", "Mixer clip audio", "Metadati"] as const;
const TR = ["Proprietà", "Grafica essenziale", "Testo"] as const;
const BL = ["Progetto", "Browser multimediale", "Librerie", "Info", "Effetti", "Cronologia"] as const;
const PANEL_ID: Record<string, PanelId> = {
  Sorgente: "source",
  "Controlli effetti": "effectControls",
  "Mixer clip audio": "mixer",
  Metadati: "metadata",
  Proprietà: "properties",
  "Grafica essenziale": "graphics",
  Testo: "text",
  Progetto: "project",
  "Browser multimediale": "media",
  Librerie: "libraries",
  Info: "info",
  Effetti: "effects",
  Cronologia: "history",
};

const TOOL_HINT: Record<PrTool, string> = {
  select: "Fai clic per selezionare, oppure fai clic in uno spazio vuoto e trascina per una selezione a riquadro. Usa Maiusc, Alt e Ctrl per altre opzioni.",
  trackFwd: "Fai clic per selezionare tutte le clip a destra del puntatore. Maiusc: solo questa traccia.",
  trackBack: "Fai clic per selezionare tutte le clip a sinistra del puntatore. Maiusc: solo questa traccia.",
  ripple: "Trascina il bordo di una clip per rifilarla spostando le clip successive.",
  roll: "Trascina un punto di modifica per spostarlo tra due clip senza cambiare la durata totale.",
  rate: "Trascina il bordo di una clip per cambiarne la velocità.",
  razor: "Fai clic per tagliare la clip. Maiusc+clic: taglia tutte le tracce.",
  slip: "Trascina una clip per cambiarne attacco e uscita senza spostarla.",
  slide: "Trascina una clip per spostarla tra le clip vicine.",
  pen: "Fai clic sulla linea gialla della clip per aggiungere un fotogramma chiave.",
  rect: "Trascina o fai clic nel monitor Programma per creare un rettangolo.",
  ellipse: "Trascina o fai clic nel monitor Programma per creare un'ellisse.",
  hand: "Trascina per scorrere la timeline.",
  zoom: "Fai clic per ingrandire. Alt+clic per ridurre.",
  type: "Fai clic nel monitor Programma per scrivere un testo.",
};

const TOOL_GROUPS: { tools: [PrTool, string, string, ReactNode][] }[] = [
  { tools: [["select", "Strumento Selezione", "V", <MousePointer2 key="i" size={16} fill="currentColor" />]] },
  {
    tools: [
      ["trackFwd", "Strumento Selezione traccia avanti", "A", <TrackFwdIcon key="i" />],
      ["trackBack", "Strumento Selezione traccia indietro", "Maiusc+A", <TrackFwdIcon key="i" back />],
    ],
  },
  {
    tools: [
      ["ripple", "Strumento Modifica con increspatura", "B", <RippleIcon key="i" />],
      ["roll", "Strumento Modifica rotazione", "N", <RollIcon key="i" />],
      ["rate", "Strumento Allunga velocità", "R", <RateIcon key="i" />],
    ],
  },
  { tools: [["razor", "Strumento Lama", "C", <Scissors key="i" size={15} />]] },
  {
    tools: [
      ["slip", "Strumento Scorrimento", "Y", <SlipIcon key="i" />],
      ["slide", "Strumento Scivolamento", "U", <SlipIcon key="i" slide />],
    ],
  },
  {
    tools: [
      ["pen", "Strumento Penna", "P", <PenTool key="i" size={15} />],
      ["rect", "Strumento Rettangolo", "", <Square key="i" size={15} />],
      ["ellipse", "Strumento Ellisse", "", <Circle key="i" size={15} />],
    ],
  },
  {
    tools: [
      ["hand", "Strumento Mano", "H", <Hand key="i" size={15} />],
      ["zoom", "Strumento Zoom", "Z", <ZoomIn key="i" size={15} />],
    ],
  },
  { tools: [["type", "Strumento Testo", "T", <Type key="i" size={16} />]] },
];

function TrackFwdIcon({ back }: { back?: boolean }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor" style={{ transform: back ? "scaleX(-1)" : undefined }}>
      <path d="M2 2l5 4-5 4zM8 2l5 4-5 4z" />
      <path d="M14 3v8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function RippleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M8 2v12M8 4H4M8 12H4M11 6l2 2-2 2" />
    </svg>
  );
}
function RollIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M8 2v12M4 6L2 8l2 2M12 6l2 2-2 2" />
    </svg>
  );
}
function RateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M2 8h12M2 5v6M14 5v6M5 6l-2 2 2 2M11 6l2 2-2 2" />
    </svg>
  );
}
function SlipIcon({ slide }: { slide?: boolean }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x={slide ? 6 : 1} y="3" width={slide ? 6 : 16} height="8" />
      <path d="M4 7h10M6 5L4 7l2 2M12 5l2 2-2 2" />
    </svg>
  );
}

function ToolsPanel({ horizontal }: { horizontal?: boolean }) {
  const st = usePremiere();
  const [fly, setFly] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number[]>(TOOL_GROUPS.map(() => 0));
  return (
    <div className={clsx("relative flex items-center gap-1.5 py-2", horizontal ? "flex-row px-2" : "flex-col")}>
      {TOOL_GROUPS.map((g, gi) => {
        const activeIdx = g.tools.findIndex(([id]) => id === st.tool);
        const shown = g.tools[activeIdx >= 0 ? activeIdx : chosen[gi]];
        const [id, name, key, icon] = shown;
        return (
          <div key={gi} className="relative">
            <button
              type="button"
              title={`${name}${key ? ` (${key})` : ""}`}
              aria-label={name}
              onClick={() => A.setTool(id)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (g.tools.length > 1) setFly(gi);
              }}
              onPointerDown={() => {
                if (g.tools.length < 2) return;
                const timer = setTimeout(() => setFly(gi), 450);
                const clear = () => clearTimeout(timer);
                window.addEventListener("pointerup", clear, { once: true });
              }}
              className={clsx("relative grid h-8 w-8 place-items-center rounded-[5px]", activeIdx >= 0 ? "bg-[#2d63d6] text-white" : "text-[#d0d0d0] hover:bg-white/10")}
            >
              {icon}
              {g.tools.length > 1 && <span className="absolute bottom-[3px] right-[3px] h-0 w-0 border-l-[4px] border-t-[4px] border-l-transparent border-t-current opacity-70" style={{ transform: "rotate(90deg)" }} />}
            </button>
            {fly === gi && (
              <div className={clsx("absolute z-50 min-w-60 rounded-md border border-black bg-[#2b2b2b] py-1 shadow-xl", horizontal ? "bottom-full left-0 mb-1" : "left-full top-0 ml-1")} onPointerLeave={() => setFly(null)}>
                {g.tools.map(([tid, tname, tkey, ticon], ti) => (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => {
                      A.setTool(tid);
                      setChosen(chosen.map((c, k) => (k === gi ? ti : c)));
                      setFly(null);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-1.5 text-[12.5px] text-[#d6d6d6] hover:bg-[#2680eb] hover:text-white"
                  >
                    {ticon}
                    <span className="flex-1 text-left">{tname}</span>
                    <span className="text-[11px] text-[#9a9a9a]">{tkey}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Meters() {
  const st = usePremiere();
  const seq = seqOf(st);
  const T = playheadOf(st);
  const [l, r] = seq ? meterLevels(seq, st.project, T, st.playing) : [-Infinity, -Infinity];
  const pct = (db: number) => (Number.isFinite(db) ? Math.max(0, Math.min(1, (db + 60) / 60)) : 0);
  const scale = [0, -3, -6, -9, -12, -15, -18, -21, -24, -27, -30, -33, -36, -39, -42, -45, -48, -51, -54, -57];
  const show = st.playing;
  return (
    <div className="flex h-full flex-col px-2 pb-2 pt-1 text-[10px] text-[#bdbdbd]">
      <div className="flex min-h-0 flex-1 gap-1.5">
        {[l, r].map((v, i) => (
          <div key={i} className="relative w-full overflow-hidden bg-[#0d0d0d]">
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#2fbf5a_0%,#2fbf5a_75%,#e6d33a_88%,#e64a3a_100%)]" />
            <div className="absolute inset-x-0 top-0 bg-[#0d0d0d] transition-[height] duration-75" style={{ height: `${(1 - (show ? pct(v) : 0)) * 100}%` }} />
          </div>
        ))}
        <div className="relative w-6 shrink-0">
          {scale.map((d) => (
            <span key={d} className="absolute right-0 -translate-y-1/2" style={{ top: `${(-d / 60) * 100}%` }}>
              {d}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-1 flex justify-around">
        <span>S</span>
        <span>S</span>
        <span className="w-6 text-right">dB</span>
      </div>
      <div className="mt-2 space-y-0.5 text-[10.5px]">
        {[
          ["M", Number.isFinite(l) && show ? (l - 14).toFixed(1) : "–"],
          ["S", Number.isFinite(l) && show ? (l - 15).toFixed(1) : "–"],
          ["I", Number.isFinite(l) && show ? (l - 16).toFixed(1) : "–"],
          ["TP", Number.isFinite(l) && show ? Math.max(l, r).toFixed(1) : "–"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span>{k}</span>
            <span className="text-[#3d9cf0]">
              {v} {k === "TP" ? "dB" : "LUFS"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PremiereStudio() {
  const hydrated = useHydrated();
  return hydrated ? <PremiereInner /> : <div className="fixed inset-0 bg-[#121212]" />;
}

function PremiereInner() {
  const st = usePremiere();
  const wide = useWide();
  const desk = useDockLayout("pr-dock-desktop-v2", DESK_ZONES, DESK_PANELS);
  const phone = useDockLayout("pr-dock-phone-v2", PHONE_ZONES, PHONE_PANELS);
  const layout = wide ? desk : phone;
  const [sizes, setSizes] = useState({ top: 0.57, src: 0.36, prog: 0.36, proj: 0.27, meters: 110 });
  const [vw, setVw] = useState(1400);
  const [vh, setVh] = useState(800);
  const seq = seqOf(st);

  useEffect(() => {
    const on = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    on();
    window.addEventListener("resize", on);
    window.addEventListener("keydown", handlePremiereKey);
    const ids = Object.values(usePremiere.getState().project.media)
      .filter((m) => m.file)
      .map((m) => m.id);
    void restoreFiles(ids).then(() => usePremiere.setState({}));
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("keydown", handlePremiereKey);
    };
  }, []);

  // il menu Finestra porta in primo piano il pannello, ovunque sia agganciato
  const focusPanel = (p: PanelId) => {
    st.set({ focus: p, maximized: null });
    layout.show(p);
  };

  const has = !!seq;
  const sel = st.selection.length > 0;
  const menus: Menu[] = [
    {
      label: "File",
      items: [
        {
          label: "Nuovo",
          sub: [
            { label: "Sequenza…", keys: "Ctrl+N", action: () => st.set({ dialog: { type: "sequence" } }) },
            { label: "Raccoglitore", keys: "Ctrl+/", action: A.newBin },
            "-",
            { label: "Video nero", action: () => A.newSyntheticItem("black") },
            { label: "Livello di regolazione", action: () => A.newSyntheticItem("adjustment") },
            { label: "Barre e tono HD", action: () => A.newSyntheticItem("bars") },
            { label: "Mascherino colore…", action: () => st.set({ dialog: { type: "matte" } }) },
            { label: "Contatore universale", action: () => A.newSyntheticItem("countdown") },
          ],
        },
        "-",
        { label: "Salva", keys: "Ctrl+S", action: () => (st.set({ saved: true }), st.notify("Progetto salvato")) },
        { label: "Ripristina progetto di esempio", action: () => st.set({ dialog: { type: "confirm", title: "Ripristina", text: "Tornare al progetto di esempio? Le modifiche andranno perse.", onOk: st.reset } }) },
        "-",
        { label: "Importa…", keys: "Ctrl+I", action: openImport },
        "-",
        { label: "Esporta", sub: [{ label: "Media…", keys: "Ctrl+M", disabled: !has, action: () => st.set({ dialog: { type: "export" } }) }] },
        "-",
        { label: "Chiudi", action: () => (window.location.href = "/practice") },
      ],
    },
    {
      label: "Modifica",
      items: [
        { label: st.past.length ? `Annulla ${st.past.at(-1)!.label}` : "Annulla", keys: "Ctrl+Z", disabled: !st.past.length, action: st.undo },
        { label: st.future.length ? `Ripeti ${st.future[0].label}` : "Ripeti", keys: "Ctrl+Maiusc+Z", disabled: !st.future.length, action: st.redo },
        "-",
        { label: "Taglia", keys: "Ctrl+X", disabled: !sel, action: () => A.copy(true) },
        { label: "Copia", keys: "Ctrl+C", disabled: !sel, action: () => A.copy(false) },
        { label: "Incolla", keys: "Ctrl+V", disabled: !st.clipboard?.length, action: () => A.paste(false) },
        { label: "Incolla e inserisci", keys: "Ctrl+Maiusc+V", disabled: !st.clipboard?.length, action: () => A.paste(true) },
        { label: "Incolla attributi…", keys: "Ctrl+Alt+V", disabled: !st.clipboard?.length || !sel, action: () => st.set({ dialog: { type: "pasteAttr" } }) },
        { label: "Rimuovi attributi…", disabled: !sel, action: A.removeAttributes },
        "-",
        { label: "Cancella", keys: "Canc", action: () => A.deleteSelection(false) },
        { label: "Elimina con increspatura", keys: "Maiusc+Canc", action: () => A.deleteSelection(true) },
        "-",
        { label: "Seleziona tutto", keys: "Ctrl+A", action: A.selectAll },
        { label: "Deseleziona tutto", keys: "Ctrl+Maiusc+A", action: () => st.set({ selection: [] }) },
        "-",
        { label: "Scorciatoie da tastiera…", action: () => st.set({ dialog: { type: "keys" } }) },
      ],
    },
    {
      label: "Clip",
      items: [
        { label: "Velocità/Durata…", keys: "Ctrl+R", disabled: !sel, action: () => st.set({ dialog: { type: "speed", ids: st.selection } }) },
        "-",
        { label: "Inserisci", keys: ",", action: () => A.place("insert") },
        { label: "Sovrascrivi", keys: ".", action: () => A.place("overwrite") },
        "-",
        { label: "Abilita", keys: "Maiusc+E", disabled: !sel, action: A.toggleEnable },
        { label: "Collega / Scollega", keys: "Ctrl+L", disabled: !sel, action: A.linkUnlink },
        "-",
        { label: "Opzioni video", sub: [{ label: "Ridimensiona alla dimensione fotogramma", disabled: !sel, action: () => A.scaleToFrame(true) }, { label: "Imposta alla dimensione fotogramma", disabled: !sel, action: () => A.scaleToFrame(false) }] },
      ],
    },
    {
      label: "Sequenza",
      items: [
        { label: "Impostazioni sequenza…", disabled: !has, action: () => st.set({ dialog: { type: "seqSettings" } }) },
        "-",
        { label: "Solleva", keys: ";", action: () => A.liftOrExtract(false) },
        { label: "Estrai", keys: "'", action: () => A.liftOrExtract(true) },
        { label: "Aggiungi modifica", keys: "Ctrl+K", action: () => A.addEdit(false) },
        { label: "Aggiungi modifica a tutte le tracce", keys: "Ctrl+Maiusc+K", action: () => A.addEdit(true) },
        { label: "Rifila modifica precedente all'indicatore", keys: "Q", action: () => A.rippleTrimToPlayhead("prev") },
        { label: "Rifila modifica successiva all'indicatore", keys: "W", action: () => A.rippleTrimToPlayhead("next") },
        "-",
        { label: "Applica transizione video", keys: "Ctrl+D", action: () => A.applyDefaultTransition("video") },
        { label: "Applica transizione audio", keys: "Ctrl+Maiusc+D", action: () => A.applyDefaultTransition("audio") },
        { label: "Applica transizioni predefinite alla selezione", keys: "Maiusc+D", action: () => A.applyDefaultTransition("both") },
        "-",
        { label: "Ingrandisci", keys: "=", action: () => A.zoom(1.4) },
        { label: "Riduci", keys: "-", action: () => A.zoom(1 / 1.4) },
        { label: "Aggancia nella timeline", keys: "S", checked: st.snapping, action: () => st.set({ snapping: !st.snapping }) },
        { label: "Selezione collegata", checked: st.linkedSel, action: () => st.set({ linkedSel: !st.linkedSel }) },
        "-",
        { label: "Aggiungi tracce…", disabled: !has, action: () => st.set({ dialog: { type: "tracks" } }) },
      ],
    },
    {
      label: "Marcatori",
      items: [
        { label: "Contrassegna attacco", keys: "I", action: A.markIn },
        { label: "Contrassegna uscita", keys: "O", action: A.markOut },
        { label: "Contrassegna clip", keys: "X", action: A.markClip },
        { label: "Contrassegna selezione", keys: "/", action: A.markSelection },
        { label: "Vai ad attacco", keys: "Maiusc+I", action: A.goToIn },
        { label: "Vai a uscita", keys: "Maiusc+O", action: A.goToOut },
        { label: "Cancella attacco e uscita", keys: "Ctrl+Maiusc+X", action: A.clearInOut },
        "-",
        { label: "Aggiungi marcatore", keys: "M", action: A.addMarker },
        { label: "Vai al marcatore successivo", keys: "Maiusc+M", action: () => A.goMarker(1) },
        { label: "Vai al marcatore precedente", keys: "Ctrl+Maiusc+M", action: () => A.goMarker(-1) },
        { label: "Cancella tutti i marcatori", action: A.clearMarkers },
      ],
    },
    {
      label: "Grafica e titoli",
      items: [
        { label: "Nuovo livello", sub: [{ label: "Testo", action: () => seq && A.createGraphic("text", seq.width / 2, seq.height / 2) }, { label: "Rettangolo", action: () => seq && A.createGraphic("rect", seq.width / 2, seq.height / 2) }, { label: "Ellisse", action: () => seq && A.createGraphic("ellipse", seq.width / 2, seq.height / 2) }] },
        "-",
        { label: "Sfoglia modelli di grafica", action: () => focusPanel("graphics") },
      ],
    },
    {
      label: "Visualizza",
      items: [
        { label: "Ingrandimento monitor Programma", sub: (["fit", 25, 50, 100, 200] as const).map((z) => ({ label: z === "fit" ? "Adatta" : `${z}%`, checked: st.programZoom === z, action: () => st.set({ programZoom: z }) })) },
        { label: "Ingrandisci il pannello attivo", keys: "`", action: () => st.set({ maximized: st.maximized ? null : st.focus }) },
      ],
    },
    {
      label: "Finestra",
      items: [
        // ogni pannello si apre/chiude da qui (con la spunta se è aperto)
        ...windowMenu(layout, { ...PANEL_LABEL, timeline: "Timeline", program: "Programma" }),
      ],
    },
    {
      label: "Aiuto",
      items: [
        { label: "Scorciatoie da tastiera", action: () => st.set({ dialog: { type: "keys" } }) },
        { label: "Torna alle lezioni di SqueakEdit", action: () => (window.location.href = "/learn") },
      ],
    },
  ];

  const labels: Record<string, string> = { ...PANEL_LABEL, program: `Programma: ${seq?.name ?? "(nessuna sequenza)"}`, timeline: seq?.name ?? "Timeline" };
  const panelFor = (id: string): ReactNode => {
    switch (id) {
      case "source":
        return <SourceMonitor />;
      case "effectControls":
        return <EffectControls />;
      case "mixer":
        return <AudioMixer />;
      case "metadata":
        return <Metadata />;
      case "program":
        return <ProgramMonitor />;
      case "properties":
        return <PropertiesPanel />;
      case "graphics":
        return <EssentialGraphics />;
      case "text":
        return <TextPanel />;
      case "project":
        return <ProjectPanel />;
      case "media":
        return <MediaBrowser />;
      case "libraries":
        return <Libraries />;
      case "info":
        return <InfoPanel />;
      case "effects":
        return <EffectsPanel />;
      case "history":
        return <HistoryPanel />;
      case "timeline":
        return (
          <div
            className="absolute inset-0 flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const preset = e.dataTransfer.getData("text/x-preset");
              if (preset) applyPreset(preset);
            }}
          >
            {st.openSeqs.length > 1 && (
              <div className="flex shrink-0 gap-1 overflow-x-auto px-2 pb-1 [scrollbar-width:none]">
                {st.openSeqs.map((id) => (
                  <span key={id} className={clsx("flex shrink-0 items-center gap-1.5 rounded px-2 py-0.5 text-[11.5px]", id === seq?.id ? "bg-[#3a3a3a] text-white" : "text-[#9a9a9a] hover:bg-white/5")}>
                    <button type="button" onClick={() => st.openSequence(id)}>
                      {st.project.sequences[id]?.name}
                    </button>
                    <CloseX onClick={() => st.closeSequence(id)} />
                  </span>
                ))}
              </div>
            )}
            <div className="relative min-h-0 flex-1">
              <Timeline />
            </div>
          </div>
        );
    }
    return null;
  };
  const zoneMenu = (tab: string): MenuItemLike[] =>
    tab === "timeline"
      ? [
          { label: "Impostazioni sequenza…", disabled: !has, action: () => st.set({ dialog: { type: "seqSettings" } }) },
          { label: "Aggiungi tracce…", disabled: !has, action: () => st.set({ dialog: { type: "tracks" } }) },
          { label: "Chiudi sequenza", disabled: !has, action: () => seq && st.closeSequence(seq.id) },
        ]
      : tab === "project"
        ? [
            { label: "Nuovo raccoglitore", action: A.newBin },
            { label: "Importa…", action: openImport },
          ]
        : tab === "source"
          ? [{ label: "Chiudi clip", action: () => st.set({ source: { mediaId: null, t: 0, in: null, out: null, playing: false } }) }]
          : [{ label: "Ingrandisci pannello", keys: "`", action: () => st.set({ maximized: tab as PanelId }) }];
  const zone = (id: string, cls?: string, style?: React.CSSProperties) => (
    <DockZone
      id={id}
      layout={layout}
      labels={labels}
      render={panelFor}
      zoneNames={wide ? DESK_ZONE_NAMES : PHONE_ZONE_NAMES}
      focused={st.focus === layout.zones[id]?.active}
      onFocus={(tab) => st.set({ focus: tab as PanelId })}
      className={cls}
      style={style}
      menu={zoneMenu}
    />
  );

  const header = (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-[#0f0f0f] bg-[#1b1b1b] px-3 text-[14px]">
      <Link href="/practice" title="Home (torna a Pratica)" className="grid h-8 w-8 place-items-center rounded text-[#d0d0d0] hover:bg-white/10">
        <Home size={17} />
      </Link>
      {(
        [
          ["import", "Importa"],
          ["edit", "Modifica"],
          ["export", "Esporta"],
        ] as const
      ).map(([m, label]) => (
        <button
          key={m}
          type="button"
          onClick={() => (m === "export" ? (seq ? st.set({ dialog: { type: "export" } }) : st.notify("Apri prima una sequenza")) : st.set({ mode: m }))}
          className={clsx("px-3 py-1", st.mode === m ? "text-white underline decoration-2 underline-offset-[9px]" : "text-[#d0d0d0] hover:text-white")}
        >
          {label}
        </button>
      ))}
      <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 text-[14px] font-semibold text-[#e6e6e6] md:block">
        {st.project.name}
        {st.saved ? "" : " - Modificato"}
      </div>
      <div className="ml-auto flex items-center gap-1 text-[#d0d0d0]">
        <button type="button" title="Area di lavoro" className="flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-semibold hover:bg-white/10" onClick={(e) => st.set({ menu: { x: e.clientX - 160, y: e.clientY + 14, items: [{ label: "Modifica", checked: true }, { label: "Ripristina layout salvato", action: () => (setSizes({ top: 0.57, src: 0.36, prog: 0.36, proj: 0.27, meters: 110 }), layout.reset()) }] } })}>
          <span className="hidden sm:inline">MODIFICA</span> <LayoutPanelLeft size={15} />
        </button>
        {[
          [Moon, "Tema", () => st.notify("Il tema scuro è l'unico disponibile")],
          [Share, "Esportazione rapida", () => (seq ? st.set({ dialog: { type: "export" } }) : null)],
          [Bell, "Notifiche", () => st.notify("Nessuna notifica")],
          [Search, "Cerca nella guida", () => st.set({ dialog: { type: "keys" } })],
          [Volume2, "Volume", () => st.notify("Volume master del simulatore")],
          [Expand, "Schermo intero", () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())],
        ].map(([Icon, title, fn]) => {
          const I = Icon as typeof Moon;
          return (
            <button key={title as string} type="button" title={title as string} onClick={fn as () => void} className="hidden h-8 w-8 place-items-center rounded hover:bg-white/10 sm:grid">
              <I size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );

  let body: ReactNode;
  if (st.mode === "import") {
    body = (
      <div className="flex min-h-0 flex-1 gap-1 p-1">
        <Panel tabs={["Importa"]} tab="Importa" className="flex-1">
          <div className="grid h-full grid-rows-[auto_1fr] gap-3 p-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void A.importFiles(e.dataTransfer.files);
              }}
              className="grid h-40 place-items-center rounded-lg border-2 border-dashed border-[#3a3a3a] text-center text-[13px] text-[#9a9a9a]"
            >
              <div>
                Trascina qui video, audio e immagini dal tuo computer
                <br />
                <button type="button" onClick={openImport} className="mt-3 rounded-full bg-[#2680eb] px-4 py-1.5 font-semibold text-white hover:bg-[#1473e6]">
                  Sfoglia…
                </button>
              </div>
            </div>
            <div className="min-h-0">
              <MediaBrowser />
            </div>
          </div>
        </Panel>
        <Panel tabs={["Progetto"]} tab="Progetto" className="w-[40%]">
          <ProjectPanel />
        </Panel>
      </div>
    );
  } else if (st.maximized) {
    body = (
      <div className="flex min-h-0 flex-1 p-1">
        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[4px] border border-[#2d8ceb] bg-[#1e1e1e]">
          <div className="flex h-[34px] shrink-0 items-center gap-2 px-3 text-[12.5px] text-white">
            {labels[st.maximized] ?? st.maximized}
            <button type="button" onClick={() => st.set({ maximized: null })} className="ml-auto text-[#9a9a9a] hover:text-white">
              Ripristina (`)
            </button>
          </div>
          <div className="relative min-h-0 flex-1">{panelFor(st.maximized)}</div>
        </section>
      </div>
    );
  } else if (wide) {
    const topH = Math.round((vh - 26 - 44 - 24) * sizes.top);
    body = (
      <div className="flex min-h-0 flex-1 flex-col p-1">
        <div className="flex shrink-0" style={{ height: topH }}>
          {zone("TL", "shrink-0", { width: sizes.src * vw })}
          <Gutter dir="x" onDrag={(d) => setSizes((s) => ({ ...s, src: Math.max(0.15, Math.min(0.5, s.src + d / vw)) }))} />
          {zone("TC", "shrink-0", { width: sizes.prog * vw })}
          <Gutter dir="x" onDrag={(d) => setSizes((s) => ({ ...s, prog: Math.max(0.2, Math.min(0.6, s.prog + d / vw)) }))} />
          {zone("TR", "min-w-0 flex-1")}
        </div>
        <Gutter dir="y" onDrag={(d) => setSizes((s) => ({ ...s, top: Math.max(0.25, Math.min(0.75, s.top + d / vh)) }))} />
        <div className="flex min-h-0 flex-1">
          {zone("BL", "shrink-0", { width: sizes.proj * vw })}
          <Gutter dir="x" onDrag={(d) => setSizes((s) => ({ ...s, proj: Math.max(0.15, Math.min(0.5, s.proj + d / vw)) }))} />
          <div className="w-[52px] shrink-0 rounded-[4px] bg-[#1e1e1e]" onPointerDownCapture={() => st.set({ focus: "tools" })}>
            <ToolsPanel />
          </div>
          <Gutter dir="x" onDrag={() => {}} />
          {zone("BR", "min-w-0 flex-1")}
        </div>
      </div>
    );
  } else {
    // telefono: due zone compatte con gli strumenti in mezzo
    body = (
      <div className="flex min-h-0 flex-1 flex-col gap-1 p-1">
        {zone("A", "shrink-0", { height: `${Math.round(sizes.top * 80)}%` })}
        <Gutter dir="y" onDrag={(d) => setSizes((s) => ({ ...s, top: Math.max(0.3, Math.min(0.9, s.top + d / vh)) }))} />
        <div className="flex shrink-0 items-center overflow-x-auto rounded-[4px] bg-[#1e1e1e] [scrollbar-width:none]">
          <ToolsPanel horizontal />
          <div className="ml-auto flex shrink-0 gap-0.5 pr-1 text-[11px] font-semibold text-[#d0d0d0]">
            <button type="button" onClick={() => A.togglePlay()} className="rounded px-2 py-1.5 hover:bg-white/10">
              {st.playing ? "Pausa" : "Play"}
            </button>
            <button type="button" onClick={() => A.addEdit(true)} className="rounded px-2 py-1.5 hover:bg-white/10">
              Taglia
            </button>
            <button type="button" onClick={() => A.deleteSelection(true)} className="rounded px-2 py-1.5 hover:bg-white/10">
              Elimina
            </button>
            <button type="button" onClick={st.undo} className="rounded px-2 py-1.5 hover:bg-white/10">
              Annulla
            </button>
          </div>
        </div>
        {zone("B", "min-h-0 flex-1")}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex select-none flex-col bg-[#121212] text-[#d0d0d0]"
      onDragOver={(e) => e.dataTransfer.types.includes("Files") && e.preventDefault()}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        void A.importFiles(e.dataTransfer.files);
      }}
    >
      <MenuBar app="Premiere Pro" menus={menus} right={<span className="hidden md:inline">Simulatore SqueakEdit</span>} />
      {header}
      {body}
      {wide && <div className="flex h-6 shrink-0 items-center truncate px-3 text-[11.5px] text-[#bdbdbd]">{TOOL_HINT[st.tool]}</div>}
      <DragGhost />
      <input
        id="pr-import-input"
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void A.importFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <PremiereDialogs />
      {st.menu && <ContextMenu x={st.menu.x} y={st.menu.y} items={st.menu.items} onClose={() => st.set({ menu: null })} />}
      <Toast text={st.toast} />
    </div>
  );
}
