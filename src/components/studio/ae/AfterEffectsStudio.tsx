"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Anchor, Brush, Circle, Eraser, Hand, Home, MousePointer2, PenTool, Pin, RotateCw, Search, Square, Stamp, Star, Type, ZoomIn, Hexagon, ChevronsRight, Orbit } from "lucide-react";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useIsPhone } from "@/lib/hooks/useIsPhone";
import { DesktopOnly } from "../DesktopOnly";
import { isEmbedded, studioExit } from "../embed";
import { recoverSandbox } from "@/lib/lessons/sandbox";
import { EFFECTS, EFFECT_CATEGORIES } from "@/lib/studio/effects";
import { restoreFiles } from "@/lib/studio/media";
import { compOf, useAe, type AeTool } from "@/lib/studio/ae";
import { ContextMenu, Gutter, MenuBar, Toast, useWide, type Menu } from "../chrome";
import { CloseX, DockRows, DockZone, DragGhost, useDockLayout, windowMenu, type Zones } from "../dock";
import { AeTimeline } from "./AeTimeline";
import { Viewer } from "./Viewer";
import { AeAlign, AeCharacter, AeEffectControls, AeEffectsPresets, AeProjectPanel, AeProperties, AeTracker, applyAePreset, openAeImport } from "./Panels";
import { AeDialogs } from "./AeDialogs";
import { handleAeKey } from "./aeKeys";
import * as A from "./actions";

const PANEL_LABEL: Record<string, string> = {
  project: "Progetto",
  effectControls: "Controlli effetti",
  effects: "Effetti e predefiniti",
  properties: "Proprietà",
  character: "Carattere",
  align: "Allinea",
  tracker: "Tracciatore",
  composition: "Composizione",
  queue: "Coda di rendering",
  timeline: "Timeline",
};
const DESK_ZONES: Zones = {
  LEFT: { tabs: ["project", "effectControls", "effects", "properties", "character", "align"], active: "project" },
  RIGHT: { tabs: ["composition"], active: "composition" },
  BOTTOM: { tabs: ["timeline"], active: "timeline" },
  L0: { tabs: [], active: "" },
  MID: { tabs: [], active: "" },
  R2: { tabs: [], active: "" },
  B0: { tabs: [], active: "" },
  B2: { tabs: [], active: "" },
};
const DESK_PANELS = Object.values(DESK_ZONES).flatMap((z) => z.tabs);
const DESK_ZONE_NAMES = { L0: "Nuova colonna a sinistra", LEFT: "In alto a sinistra", MID: "Nuova colonna in mezzo", RIGHT: "In alto a destra", R2: "Nuova colonna a destra", B0: "In basso a sinistra", BOTTOM: "In basso", B2: "In basso a destra" };
const DESK_ROWS = [
  { id: "top", zones: ["L0", "LEFT", "MID", "RIGHT", "R2"] },
  { id: "bottom", zones: ["B0", "BOTTOM", "B2"] },
];
const DESK_WEIGHTS = { top: 0.6, bottom: 0.4, L0: 0.25, LEFT: 0.48, MID: 0.3, RIGHT: 0.52, R2: 0.25, B0: 0.3, BOTTOM: 1, B2: 0.3 };
const PHONE_ROWS = [
  { id: "a", zones: ["A"] },
  { id: "b", zones: ["B"] },
];
const PHONE_ZONES: Zones = {
  A: { tabs: ["composition", "project", "effectControls", "effects", "properties", "character"], active: "composition" },
  B: { tabs: ["timeline"], active: "timeline" },
};
const PHONE_PANELS = Object.values(PHONE_ZONES).flatMap((z) => z.tabs);
const PHONE_ZONE_NAMES = { A: "Pannello in alto", B: "Pannello in basso" };
const LEFT_TABS = ["Progetto", "Controlli effetti", "Effetti e predefiniti", "Proprietà", "Carattere", "Allinea", "Tracciatore"] as const;
type LeftTab = (typeof LEFT_TABS)[number];
const WORKSPACES = ["Predefinito", "Revisione", "Scopri", "Schermo piccolo", "Standard", "Librerie"];

const TOOLS: { tools: [AeTool | null, string, string, ReactNode][] }[] = [
  { tools: [["select", "Strumento Selezione", "V", <MousePointer2 key="i" size={16} fill="currentColor" />]] },
  { tools: [["hand", "Strumento Mano", "H", <Hand key="i" size={16} />]] },
  { tools: [["zoom", "Strumento Zoom", "Z", <ZoomIn key="i" size={16} />]] },
  { tools: [[null, "Strumento Orbita attorno alla camera", "1", <Orbit key="i" size={16} />]] },
  { tools: [["anchor", "Strumento Retro (punto di ancoraggio)", "Y", <Anchor key="i" size={16} />]] },
  { tools: [["rotate", "Strumento Rotazione", "W", <RotateCw key="i" size={16} />]] },
  {
    tools: [
      ["rect", "Strumento Rettangolo", "Q", <Square key="i" size={16} />],
      ["rrect", "Strumento Rettangolo arrotondato", "Q", <Square key="i" size={16} className="rounded" />],
      ["ellipse", "Strumento Ellisse", "Q", <Circle key="i" size={16} />],
      ["polygon", "Strumento Poligono", "Q", <Hexagon key="i" size={16} />],
      ["star", "Strumento Stella", "Q", <Star key="i" size={16} />],
    ],
  },
  { tools: [["pen", "Strumento Penna", "G", <PenTool key="i" size={16} />]] },
  {
    tools: [
      ["text", "Strumento Testo orizzontale", "Ctrl+T", <Type key="i" size={17} />],
      ["vtext", "Strumento Testo verticale", "Ctrl+T", <Type key="i" size={17} className="rotate-90" />],
    ],
  },
  { tools: [[null, "Strumento Pennello", "Ctrl+B", <Brush key="i" size={16} />]] },
  { tools: [[null, "Strumento Timbro clone", "Ctrl+B", <Stamp key="i" size={16} />]] },
  { tools: [[null, "Strumento Gomma", "Ctrl+B", <Eraser key="i" size={16} />]] },
  { tools: [[null, "Strumento Pennello roto", "Alt+W", <Brush key="i" size={16} className="opacity-70" />]] },
  { tools: [[null, "Strumento Puppet Position Pin", "Ctrl+P", <Pin key="i" size={16} />]] },
];

function Toolbar() {
  const st = useAe();
  const [fly, setFly] = useState<number | null>(null);
  const [ws, setWs] = useState("Standard");
  return (
    <div className="relative z-40 flex h-[46px] shrink-0 items-center gap-0.5 border-b border-[#0f0f0f] bg-[#232323] px-2 text-[#d0d0d0]">
      <Link href="/practice" onClick={(e) => isEmbedded() && (e.preventDefault(), studioExit("/practice"))} title="Home" className="grid h-8 w-8 place-items-center rounded hover:bg-white/10">
        <Home size={17} />
      </Link>
      {TOOLS.map((g, gi) => {
        const ai = g.tools.findIndex(([id]) => id === st.tool);
        const [id, name, key, icon] = g.tools[Math.max(0, ai)];
        return (
          <div key={gi} className={clsx("relative", !g.tools.some(([t]) => t) && "hidden sm:block")}>
            <button
              type="button"
              title={`${name} (${key})`}
              onClick={() => (id ? st.set({ tool: id }) : st.notify(`${name}: non disponibile nel simulatore`))}
              onContextMenu={(e) => {
                e.preventDefault();
                if (g.tools.length > 1) setFly(gi);
              }}
              onPointerDown={() => {
                if (g.tools.length < 2) return;
                const tm = setTimeout(() => setFly(gi), 450);
                window.addEventListener("pointerup", () => clearTimeout(tm), { once: true });
              }}
              className={clsx("relative grid h-8 w-8 place-items-center rounded", ai >= 0 ? "bg-[#2d63d6] text-white" : id ? "hover:bg-white/10" : "opacity-50 hover:bg-white/5")}
            >
              {icon}
              {g.tools.length > 1 && <span className="absolute bottom-[3px] right-[3px] h-0 w-0 border-l-[3px] border-t-[3px] border-l-transparent border-t-current" style={{ transform: "rotate(90deg)" }} />}
            </button>
            {fly === gi && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-64 rounded-md border border-black bg-[#2b2b2b] py-1 shadow-xl" onPointerLeave={() => setFly(null)}>
                {g.tools.map(([tid, tname, tkey, ticon]) => (
                  <button
                    key={tname}
                    type="button"
                    onClick={() => {
                      if (tid) st.set({ tool: tid });
                      setFly(null);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-1.5 text-[12.5px] hover:bg-[#2680eb] hover:text-white"
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
      <span className="mx-2 h-6 w-px bg-[#3a3a3a]" />
      <label className="flex items-center gap-1.5 text-[13px]">
        <input type="checkbox" checked={st.snapping} onChange={(e) => st.set({ snapping: e.target.checked })} className="h-3.5 w-3.5 accent-[#2680eb]" />
        Aggancio
      </label>
      <div className="ml-auto hidden items-center gap-6 pr-2 text-[13px] xl:flex">
        {WORKSPACES.map((w) => (
          <button key={w} type="button" onClick={() => setWs(w)} className={clsx(w === ws ? "text-white underline decoration-2 underline-offset-[8px]" : "text-[#d0d0d0] hover:text-white")}>
            {w}
          </button>
        ))}
        <ChevronsRight size={15} />
      </div>
      <button type="button" title="Cerca nella guida" onClick={() => st.set({ dialog: { type: "keys" } })} className="ml-2 grid h-8 w-8 place-items-center rounded hover:bg-white/10 xl:ml-0">
        <Search size={16} />
      </button>
    </div>
  );
}

export function AfterEffectsStudio() {
  const hydrated = useHydrated();
  const phone = useIsPhone();
  useEffect(() => recoverSandbox("ae"), []);
  if (!hydrated) return <div className="fixed inset-0 bg-[#121212]" />;
  return phone ? <DesktopOnly app="After Effects" /> : <AeInner />;
}

export function AeStudioEmbedded() {
  return <AeInner />;
}

const keyEv = (key: string) => handleAeKey(new KeyboardEvent("keydown", { key }));

function AeInner() {
  const st = useAe();
  const wide = useWide();
  const comp = compOf(st);
  const desk = useDockLayout("ae-dock-desktop-v2", DESK_ZONES, DESK_PANELS);
  const phone = useDockLayout("ae-dock-phone-v2", PHONE_ZONES, PHONE_PANELS);
  const layout = wide ? desk : phone;
  const [sizes, setSizes] = useState({ top: 0.6, left: 0.48 });
  const [vw, setVw] = useState(1400);
  const [vh, setVh] = useState(800);

  useEffect(() => {
    const on = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    on();
    window.addEventListener("resize", on);
    window.addEventListener("keydown", handleAeKey);
    const ids = Object.values(useAe.getState().project.media)
      .filter((m) => m.file)
      .map((m) => m.id);
    void restoreFiles(ids).then(() => useAe.setState({}));
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("keydown", handleAeKey);
    };
  }, []);

  const sel = st.selected.length > 0;
  const layer = comp?.layers.find((l) => st.selected.includes(l.id));
  const menus: Menu[] = [
    {
      label: "File",
      items: [
        { label: "Nuovo", sub: [{ label: "Nuovo progetto", action: () => st.set({ dialog: { type: "confirm", title: "Nuovo progetto", text: "Tornare al progetto di esempio? Le modifiche andranno perse.", onOk: st.reset } }) }, { label: "Nuova cartella", keys: "Ctrl+Alt+Maiusc+N", action: A.newFolder }] },
        { label: "Salva", keys: "Ctrl+S", action: () => (st.set({ saved: true }), st.notify("Progetto salvato")) },
        "-",
        { label: "Importa", sub: [{ label: "File…", keys: "Ctrl+I", action: openAeImport }] },
        "-",
        { label: "Esporta", sub: [{ label: "Aggiungi alla coda di rendering", keys: "Ctrl+M", action: () => st.notify("L'esportazione non è disponibile nel simulatore") }] },
        { label: "Chiudi", action: () => studioExit("/practice") },
      ],
    },
    {
      label: "Modifica",
      items: [
        { label: st.past.length ? `Annulla ${st.past.at(-1)!.label}` : "Annulla", keys: "Ctrl+Z", disabled: !st.past.length, action: st.undo },
        { label: st.future.length ? `Ripeti ${st.future[0].label}` : "Ripeti", keys: "Ctrl+Maiusc+Z", disabled: !st.future.length, action: st.redo },
        "-",
        { label: "Taglia", keys: "Ctrl+X", action: () => A.copy(true) },
        { label: "Copia", keys: "Ctrl+C", action: () => A.copy(false) },
        { label: "Incolla", keys: "Ctrl+V", disabled: !st.clipboard, action: A.paste },
        { label: "Elimina", keys: "Canc", action: A.deleteSelected },
        "-",
        { label: "Duplica", keys: "Ctrl+D", disabled: !sel, action: A.duplicate },
        { label: "Dividi livello", keys: "Ctrl+Maiusc+D", disabled: !sel, action: A.splitLayer },
        "-",
        { label: "Seleziona tutto", keys: "Ctrl+A", action: A.selectAll },
        { label: "Deseleziona tutto", keys: "Ctrl+Maiusc+A", action: () => st.set({ selected: [], selectedKeys: [] }) },
        "-",
        { label: "Scelte rapide da tastiera", action: () => st.set({ dialog: { type: "keys" } }) },
      ],
    },
    {
      label: "Composizione",
      items: [
        { label: "Nuova composizione…", keys: "Ctrl+N", action: () => st.set({ dialog: { type: "comp" } }) },
        { label: "Impostazioni composizione…", keys: "Ctrl+K", disabled: !comp, action: () => comp && st.set({ dialog: { type: "comp", id: comp.id } }) },
        "-",
        { label: "Imposta inizio area di lavoro", keys: "B", action: () => keyEv("b") },
        { label: "Imposta fine area di lavoro", keys: "N", action: () => keyEv("n") },
        "-",
        { label: "Anteprima", keys: "Spazio", action: () => st.set({ playing: !st.playing }) },
        { label: "Aggiungi alla coda di rendering", keys: "Ctrl+M", action: () => st.notify("L'esportazione non è disponibile nel simulatore") },
      ],
    },
    {
      label: "Livello",
      items: [
        {
          label: "Nuovo",
          sub: [
            { label: "Testo", keys: "Ctrl+Alt+Maiusc+T", action: () => A.addLayer("text") },
            { label: "Tinta unita…", keys: "Ctrl+Y", action: () => st.set({ dialog: { type: "solid" } }) },
            { label: "Oggetto nullo", keys: "Ctrl+Alt+Maiusc+Y", action: () => A.addLayer("null") },
            { label: "Livello forma", action: () => A.addLayer("shape") },
            { label: "Livello di regolazione", keys: "Ctrl+Alt+Y", action: () => A.addLayer("adjustment") },
          ],
        },
        { label: "Impostazioni tinta unita…", keys: "Ctrl+Maiusc+Y", disabled: layer?.type !== "solid", action: () => layer && st.set({ dialog: { type: "solid", layerId: layer.id } }) },
        "-",
        {
          label: "Maschera",
          sub: [
            {
              label: "Nuova maschera",
              disabled: !layer,
              action: () =>
                layer &&
                A.updateLayer(
                  layer.id,
                  (l) => ({ ...l, masks: [...l.masks, { id: Math.random().toString(36).slice(2), name: `Maschera ${l.masks.length + 1}`, mode: "add", inverted: false, kind: "rect", path: [0, 0, l.w || 400, l.h || 400], feather: { value: [0], keys: null }, opacity: { value: [100], keys: null }, expansion: { value: [0], keys: null } }] }),
                  "Nuova maschera",
                ),
            },
          ],
        },
        {
          label: "Trasforma",
          sub: [
            { label: "Centra punto di ancoraggio nel contenuto", keys: "Ctrl+Alt+Home", action: A.centerAnchor },
            { label: "Centra il livello nella vista", keys: "Ctrl+Home", action: A.centerLayer },
            { label: "Adatta alla composizione", keys: "Ctrl+Alt+F", action: () => A.fitToComp("fit") },
          ],
        },
        { label: "Tempo", sub: [{ label: "Inverti tempo livello", keys: "Ctrl+Alt+R", action: A.reverseLayer }] },
        { label: "Livello 3D", disabled: !sel, checked: !!layer?.threeD, action: () => A.toggle3D() },
        "-",
        {
          label: "Disponi",
          sub: [
            { label: "Porta il livello in primo piano", keys: "Ctrl+Maiusc+]", action: () => A.moveLayerOrder("top") },
            { label: "Porta avanti il livello", keys: "Ctrl+]", action: () => A.moveLayerOrder("up") },
            { label: "Porta indietro il livello", keys: "Ctrl+[", action: () => A.moveLayerOrder("down") },
            { label: "Porta il livello in fondo", keys: "Ctrl+Maiusc+[", action: () => A.moveLayerOrder("bottom") },
          ],
        },
        { label: "Pre-componi…", keys: "Ctrl+Maiusc+C", disabled: !sel, action: () => st.set({ dialog: { type: "precompose" } }) },
      ],
    },
    {
      label: "Effetto",
      items: [
        ...EFFECT_CATEGORIES.filter((c) => EFFECTS.some((e) => e.category === c && !e.audio)).map((cat) => ({
          label: cat,
          sub: EFFECTS.filter((e) => e.category === cat && !e.audio).map((e) => ({ label: e.name, disabled: !sel, action: () => A.applyEffect(e.id) })),
        })),
        "-",
        { label: "Rimuovi tutto", disabled: !sel, action: () => st.commitComp((c) => ({ ...c, layers: c.layers.map((l) => (st.selected.includes(l.id) ? { ...l, effects: [] } : l)) }), "Rimuovi effetti") },
      ],
    },
    {
      label: "Animazione",
      items: [
        {
          label: "Applica predefinito animazione",
          sub: [
            { label: "Dissolvenza in entrata", action: () => applyAePreset("fadein") },
            { label: "Pop", action: () => applyAePreset("pop") },
            { label: "Scorri da sinistra", action: () => applyAePreset("slide") },
            { label: "Tremolio", action: () => applyAePreset("wiggle") },
            { label: "Rotazione continua", action: () => applyAePreset("spin") },
          ],
        },
        "-",
        { label: "Interpolazione fotogramma chiave", sub: [{ label: "Lineare", action: () => A.setInterp("linear") }, { label: "Bézier", action: () => A.setInterp("ease") }, { label: "Tenuta", keys: "Ctrl+Alt+H", action: () => A.setInterp("hold") }] },
        {
          label: "Assistente fotogrammi chiave",
          sub: [
            { label: "Easy Ease", keys: "F9", action: () => A.setInterp("ease") },
            { label: "Easy Ease in entrata", keys: "Maiusc+F9", action: () => A.setInterp("easeIn") },
            { label: "Easy Ease in uscita", keys: "Ctrl+Maiusc+F9", action: () => A.setInterp("easeOut") },
          ],
        },
        "-",
        { label: "Aggiungi espressione", disabled: !st.selectedProps.length, action: () => st.selectedProps.forEach((p) => A.toggleStopwatchAlt(p.split("|")[0], p.split("|")[1])) },
        { label: "Mostra proprietà animate", keys: "U", action: () => A.reveal("animated", false) },
      ],
    },
    {
      label: "Visualizza",
      items: [
        { label: "Ingrandisci", action: () => st.set({ viewerZoom: Math.min(800, (st.viewerZoom === "fit" ? 50 : st.viewerZoom) * 2) }) },
        { label: "Riduci", action: () => st.set({ viewerZoom: Math.max(5, (st.viewerZoom === "fit" ? 50 : st.viewerZoom) / 2) }) },
        { label: "Adatta", action: () => st.set({ viewerZoom: "fit" }) },
        "-",
        { label: "Editor grafico", keys: "Maiusc+F3", checked: st.graph, action: () => st.set({ graph: !st.graph }) },
        { label: "Mostra modalità", keys: "F4", checked: st.modes, action: () => st.set({ modes: !st.modes }) },
      ],
    },
    { label: "Finestra", items: windowMenu(layout, PANEL_LABEL) },
    { label: "Aiuto", items: [{ label: "Scelte rapide da tastiera", action: () => st.set({ dialog: { type: "keys" } }) }, { label: "Torna alle lezioni di SqueakEdit", action: () => studioExit("/learn") }] },
  ];

  const labels: Record<string, string> = { ...PANEL_LABEL, effectControls: `Controlli effetti ${layer ? layer.name : "(nessuno)"}`, composition: `Composizione ${comp?.name ?? ""}`, timeline: comp?.name ?? "Timeline" };
  const panelFor = (id: string): ReactNode => {
    switch (id) {
      case "project":
        return <AeProjectPanel />;
      case "effectControls":
        return <AeEffectControls />;
      case "effects":
        return <AeEffectsPresets />;
      case "properties":
        return <AeProperties />;
      case "character":
        return <AeCharacter />;
      case "align":
        return <AeAlign />;
      case "tracker":
        return <AeTracker />;
      case "composition":
        return <Viewer />;
      case "queue":
        return <div className="grid h-full place-items-center p-4 text-center text-[12px] text-[#8a8a8a]">La coda di rendering è vuota: l&apos;esportazione non è disponibile nel simulatore.</div>;
      case "timeline":
        return (
          <div className="absolute inset-0 flex flex-col">
            {st.openComps.length > 1 && (
              <div className="flex shrink-0 gap-1 overflow-x-auto px-2 pb-1 [scrollbar-width:none]">
                {st.openComps.map((id2) => (
                  <span key={id2} className={clsx("flex shrink-0 items-center gap-1.5 rounded px-2 py-0.5 text-[11.5px]", id2 === comp?.id ? "bg-[#3a3a3a] text-white" : "text-[#9a9a9a] hover:bg-white/5")}>
                    <button type="button" onClick={() => st.openComp(id2)}>
                      {st.project.comps[id2]?.name}
                    </button>
                    <CloseX onClick={() => st.closeComp(id2)} />
                  </span>
                ))}
              </div>
            )}
            <div className="relative min-h-0 flex-1">
              <AeTimeline />
            </div>
          </div>
        );
    }
    return null;
  };
  const zone = (id: string, cls?: string, style?: React.CSSProperties) => (
    <DockZone id={id} layout={layout} labels={labels} render={panelFor} zoneNames={wide ? DESK_ZONE_NAMES : PHONE_ZONE_NAMES} focused={id === "B" || id === "BOTTOM"} className={cls} style={style} />
  );

  let body: ReactNode;
  if (wide) {
    body = <DockRows layout={layout} rows={DESK_ROWS} storageKey="ae-dock-sizes-v3" defaults={DESK_WEIGHTS} zone={zone} />;
  } else {
    body = (
      <DockRows
        layout={layout}
        rows={PHONE_ROWS}
        storageKey="ae-dock-phone-sizes-v3"
        defaults={{ a: 0.6, b: 0.4 }}
        zone={zone}
        between={
          <div className="flex shrink-0 gap-0.5 overflow-x-auto rounded-[4px] bg-[#1e1e1e] p-0.5 text-[11px] font-semibold text-[#d0d0d0] [scrollbar-width:none]">
          {(
            [
              [st.playing ? "Pausa" : "Play", () => st.set({ playing: !st.playing })],
              ["Easy Ease", () => A.setInterp("ease")],
              ["P", () => A.reveal(["t.position"], false)],
              ["S", () => A.reveal(["t.scale"], false)],
              ["R", () => A.reveal(["t.rotation"], false)],
              ["T", () => A.reveal(["t.opacity"], false)],
              ["Duplica", A.duplicate],
              ["Elimina", A.deleteSelected],
              ["Annulla", st.undo],
            ] as [string, () => void][]
          ).map(([label, fn]) => (
            <button key={label} type="button" onClick={fn} className="shrink-0 rounded px-2.5 py-1.5 hover:bg-white/10">
              {label}
            </button>
          ))}
        </div>
        }
      />
    );
  }

  return (
    <div
      className="force-dark fixed inset-0 flex select-none flex-col bg-[#121212] text-[#d0d0d0]"
      onDragOver={(e) => e.dataTransfer.types.includes("Files") && e.preventDefault()}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        void A.importFiles(e.dataTransfer.files);
      }}
    >
      <MenuBar app="After Effects" menus={menus} right={<span className="hidden md:inline">Simulatore SqueakEdit</span>} />
      <div className="flex h-[22px] shrink-0 items-center justify-center bg-[#1b1b1b] text-[12px] text-[#bdbdbd]">
        Simulatore After Effects - {st.project.name}
        {st.saved ? "" : " *"}
      </div>
      <Toolbar />
      {body}
      <DragGhost />
      <input
        id="ae-import-input"
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void A.importFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <AeDialogs />
      {st.menu && <ContextMenu x={st.menu.x} y={st.menu.y} items={st.menu.items} onClose={() => st.set({ menu: null })} />}
      <Toast text={st.toast} />
    </div>
  );
}
