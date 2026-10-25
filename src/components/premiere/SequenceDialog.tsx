"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronRight, Folder, FolderOpen, Film } from "lucide-react";
import type { SequenceSettings } from "@/lib/lessons/types";
import { P, PButton, PCheck, PNumber, PSelect, PTabs, Row } from "./controls";

// Finestra "Nuova sequenza" (File > Nuovo > Sequenza, Ctrl+N), riprodotta con
// le stesse schede, gli stessi preset e la stessa regola di Premiere:
// la dimensione del fotogramma si cambia solo in Modalità di modifica "Personalizzato".

interface Preset {
  name: string;
  mode: EditingMode;
  width: number;
  height: number;
  fps: number;
  desc: string;
}
interface PresetFolder {
  name: string;
  folders?: PresetFolder[];
  presets?: Preset[];
}

const EDITING_MODES = ["Personalizzato", "ARRI Cinema", "AVC-Intra 100 1080", "AVCHD 1080p", "DSLR", "DNxHD 1080p", "HDV 720p", "RED R3D", "XDCAM HD422 1080p"] as const;
type EditingMode = (typeof EDITING_MODES)[number];

const TIMEBASES = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60] as const;
const fpsLabel = (f: number) => `${String(f).replace(".", ",")} fotogrammi/secondo`;

const preset = (name: string, mode: EditingMode, width: number, height: number, fps: number, extra = ""): Preset => ({
  name,
  mode,
  width,
  height,
  fps,
  desc: `Per il montaggio con materiale ${mode}.${extra}\n${width}×${height} (pixel quadrati 1,0)\n${String(fps).replace(".", ",")} fotogrammi al secondo (fps), scansione progressiva.\nAudio a 48 kHz.`,
});

const TREE: PresetFolder[] = [
  { name: "ARRI", folders: [{ name: "1080p", presets: [preset("ARRI 1080p 25", "ARRI Cinema", 1920, 1080, 25), preset("ARRI 1080p 24", "ARRI Cinema", 1920, 1080, 24)] }] },
  { name: "AVC-Intra", presets: [preset("AVC-Intra 100 1080p 25", "AVC-Intra 100 1080", 1920, 1080, 25)] },
  {
    name: "AVCHD",
    folders: [
      { name: "1080p", presets: [preset("AVCHD 1080p25", "AVCHD 1080p", 1920, 1080, 25), preset("AVCHD 1080p30", "AVCHD 1080p", 1920, 1080, 30)] },
    ],
  },
  {
    name: "Digital SLR",
    folders: [
      {
        name: "1080p",
        presets: [
          preset("DSLR 1080p24", "DSLR", 1920, 1080, 23.976, " Consigliato per un look cinematografico."),
          preset("DSLR 1080p25", "DSLR", 1920, 1080, 25, " Standard europeo (PAL)."),
          preset("DSLR 1080p30", "DSLR", 1920, 1080, 29.97),
        ],
      },
      { name: "720p", presets: [preset("DSLR 720p50", "DSLR", 1280, 720, 50), preset("DSLR 720p60", "DSLR", 1280, 720, 59.94)] },
      { name: "2160p", presets: [preset("DSLR 2160p25", "DSLR", 3840, 2160, 25), preset("DSLR 2160p30", "DSLR", 3840, 2160, 29.97)] },
    ],
  },
  { name: "DNxHD", presets: [preset("DNxHD 1080p 25", "DNxHD 1080p", 1920, 1080, 25)] },
  { name: "HDV", presets: [preset("HDV 720p25", "HDV 720p", 1280, 720, 25)] },
  { name: "RED R3D", presets: [preset("RED 4K 25", "RED R3D", 4096, 2160, 25)] },
  { name: "XDCAM HD422", presets: [preset("XDCAM HD422 1080p25", "XDCAM HD422 1080p", 1920, 1080, 25)] },
];

const DEFAULT = TREE[3].folders![0].presets![1]; // DSLR 1080p25

function aspectLabel(w: number, h: number) {
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  const d = g(w, h) || 1;
  return `${w / d}:${h / d}`;
}

function PresetTree({ folders, depth, selected, onSelect, open, toggle }: {
  folders: PresetFolder[];
  depth: number;
  selected: string;
  onSelect: (p: Preset) => void;
  open: Set<string>;
  toggle: (key: string) => void;
}) {
  return (
    <ul>
      {folders.map((f) => {
        const key = `${depth}-${f.name}`;
        const isOpen = open.has(key);
        return (
          <li key={key}>
            <button type="button" onClick={() => toggle(key)} className="flex w-full items-center gap-1 py-[3px] text-left text-[12px] hover:bg-white/5" style={{ paddingLeft: depth * 14 + 4 }}>
              <ChevronRight size={12} className={clsx("transition-transform", isOpen && "rotate-90")} />
              {isOpen ? <FolderOpen size={13} className="text-[#d8b45a]" /> : <Folder size={13} className="text-[#d8b45a]" />}
              {f.name}
            </button>
            {isOpen && (
              <>
                {f.folders && <PresetTree folders={f.folders} depth={depth + 1} selected={selected} onSelect={onSelect} open={open} toggle={toggle} />}
                {f.presets?.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => onSelect(p)}
                    className={clsx("flex w-full items-center gap-1.5 py-[3px] text-left text-[12px]", selected === p.name ? "bg-[#2680eb] text-white" : "hover:bg-white/5")}
                    style={{ paddingLeft: (depth + 1) * 14 + 18 }}
                  >
                    <Film size={12} /> {p.name}
                  </button>
                ))}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function SequenceDialog({
  onConfirm,
  onCancel,
  error,
  initialName = "Sequenza 01",
}: {
  onConfirm: (s: SequenceSettings) => void;
  onCancel?: () => void;
  error?: string | null;
  initialName?: string;
}) {
  const [tab, setTab] = useState<"Predefiniti sequenza" | "Impostazioni" | "Tracce" | "Informazioni VR">("Predefiniti sequenza");
  const [selected, setSelected] = useState<string>(DEFAULT.name);
  const [open, setOpen] = useState(() => new Set(["0-Digital SLR", "1-1080p"]));
  const [mode, setMode] = useState<EditingMode>(DEFAULT.mode);
  const [fps, setFps] = useState<number>(DEFAULT.fps);
  const [width, setWidth] = useState(DEFAULT.width);
  const [height, setHeight] = useState(DEFAULT.height);
  const [pixel, setPixel] = useState("Pixel quadrati (1,0)");
  const [fields, setFields] = useState("Nessun campo (scansione progressiva)");
  const [sampleRate, setSampleRate] = useState<number>(48000);
  const [maxDepth, setMaxDepth] = useState(false);
  const [maxQuality, setMaxQuality] = useState(false);
  const [videoTracks, setVideoTracks] = useState(3);
  const [audioTracks, setAudioTracks] = useState<string[]>(["Standard", "Standard", "Standard"]);
  const [name, setName] = useState(initialName);

  const presetMeta = useMemo(() => {
    const all: Preset[] = [];
    const walk = (fs: PresetFolder[]) => fs.forEach((f) => (f.presets && all.push(...f.presets), f.folders && walk(f.folders)));
    walk(TREE);
    return all.find((p) => p.name === selected);
  }, [selected]);

  const choose = (p: Preset) => {
    setSelected(p.name);
    setMode(p.mode);
    setFps(p.fps);
    setWidth(p.width);
    setHeight(p.height);
  };
  // in Premiere cambiare un'impostazione trasforma il preset in "Personalizzato"
  const customize = () => setSelected("");

  const custom = mode === "Personalizzato";

  return (
    <div className={clsx(P.panel, "flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-lg border border-[#111] shadow-[0_20px_60px_rgb(0_0_0/0.6)]")}>
      <div className="flex h-9 items-center border-b border-[#111] bg-[#2b2b2b] px-4 text-[13px] font-semibold text-[#e6e6e6]">Nuova sequenza</div>
      <div className="px-4 pt-3">
        <PTabs tabs={["Predefiniti sequenza", "Impostazioni", "Tracce", "Informazioni VR"] as const} value={tab} onChange={setTab} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {tab === "Predefiniti sequenza" && (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className={clsx(P.label, "mb-1")}>Predefiniti disponibili</p>
              <div className="h-64 overflow-y-auto rounded-[4px] border border-[#3e3e3e] bg-[#1b1b1b] py-1">
                <PresetTree
                  folders={TREE}
                  depth={0}
                  selected={selected}
                  onSelect={choose}
                  open={open}
                  toggle={(k) => setOpen((s) => {
                    const n = new Set(s);
                    if (n.has(k)) n.delete(k);
                    else n.add(k);
                    return n;
                  })}
                />
              </div>
            </div>
            <div>
              <p className={clsx(P.label, "mb-1")}>Descrizione</p>
              <div className="h-64 whitespace-pre-line rounded-[4px] border border-[#3e3e3e] bg-[#1b1b1b] p-2 text-[12px] leading-relaxed">
                {presetMeta ? (
                  <>
                    <span className="font-semibold text-white">{presetMeta.name}</span>
                    {"\n"}
                    {presetMeta.desc}
                  </>
                ) : (
                  `Impostazioni personalizzate.\n${width}×${height} (${aspectLabel(width, height)})\n${String(fps).replace(".", ",")} fps`
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "Impostazioni" && (
          <div className="space-y-3">
            <Row label="Modalità di modifica:">
              <PSelect value={mode} options={EDITING_MODES} onChange={(m) => (setMode(m), customize())} className="w-56" />
            </Row>
            <Row label="Base temporale:">
              <PSelect value={fps} options={TIMEBASES} format={fpsLabel} onChange={(f) => (setFps(f), customize())} className="w-56" />
            </Row>
            <fieldset className="rounded-[4px] border border-[#3a3a3a] px-3 pb-2">
              <legend className="px-1 text-[12px] font-semibold text-[#e0e0e0]">Video</legend>
              <Row label="Dimensione fotogramma:">
                <PNumber value={width} disabled={!custom} onChange={(v) => (setWidth(v), customize())} min={16} max={16384} />
                <span className={P.label}>orizzontale</span>
                <PNumber value={height} disabled={!custom} onChange={(v) => (setHeight(v), customize())} min={16} max={16384} />
                <span className={P.label}>verticale</span>
                <span className="text-[12px] text-[#e0e0e0]">{aspectLabel(width, height)}</span>
              </Row>
              {!custom && <p className="pb-1 text-[11px] text-[#d8b45a]">Per cambiare la dimensione scegli Modalità di modifica: Personalizzato.</p>}
              <Row label="Proporzioni pixel:">
                <PSelect value={pixel} options={["Pixel quadrati (1,0)", "D1/DV PAL (1,0940)", "HD anamorfico 1080 (1,333)"]} onChange={setPixel} className="w-56" />
              </Row>
              <Row label="Campi:">
                <PSelect value={fields} options={["Nessun campo (scansione progressiva)", "Prima il campo superiore", "Prima il campo inferiore"]} onChange={setFields} className="w-56" />
              </Row>
              <Row label="Formato di visualizzazione:">
                <span className="text-[12px] text-[#e0e0e0]">{Number.isInteger(fps) ? `${fps} fps Timecode` : `${String(fps).replace(".", ",")} fps Timecode drop-frame`}</span>
              </Row>
              <Row label="Spazio di lavoro:">
                <span className="text-[12px] text-[#e0e0e0]">Rec. 709</span>
              </Row>
            </fieldset>
            <fieldset className="rounded-[4px] border border-[#3a3a3a] px-3 pb-2">
              <legend className="px-1 text-[12px] font-semibold text-[#e0e0e0]">Audio</legend>
              <Row label="Frequenza di campionamento:">
                <PSelect value={sampleRate} options={[32000, 44100, 48000, 96000] as const} format={(r) => `${r} Hz`} onChange={setSampleRate} className="w-40" />
              </Row>
              <Row label="Formato di visualizzazione:">
                <span className="text-[12px] text-[#e0e0e0]">Campioni audio</span>
              </Row>
            </fieldset>
            <fieldset className="rounded-[4px] border border-[#3a3a3a] px-3 pb-2">
              <legend className="px-1 text-[12px] font-semibold text-[#e0e0e0]">Anteprime video</legend>
              <Row label="Formato file anteprima:">
                <span className="text-[12px] text-[#e0e0e0]">I-Frame Only MPEG</span>
              </Row>
              <Row label="Larghezza / Altezza:">
                <span className="text-[12px] tabular-nums text-[#e0e0e0]">
                  {width} × {height}
                </span>
              </Row>
              <div className="flex flex-wrap gap-4 py-1">
                <PCheck checked={maxDepth} onChange={setMaxDepth}>Profondità di bit massima</PCheck>
                <PCheck checked={maxQuality} onChange={setMaxQuality}>Qualità di rendering massima</PCheck>
              </div>
            </fieldset>
          </div>
        )}

        {tab === "Tracce" && (
          <div className="space-y-3">
            <Row label="Video:">
              <PNumber value={videoTracks} onChange={setVideoTracks} min={1} max={99} className="w-16" />
              <span className={P.label}>tracce</span>
            </Row>
            <Row label="Traccia master audio:">
              <span className="text-[12px] text-[#e0e0e0]">Stereo</span>
            </Row>
            <div className="rounded-[4px] border border-[#3e3e3e]">
              <div className="grid grid-cols-[60px_1fr_1fr] border-b border-[#3e3e3e] bg-[#2b2b2b] px-2 py-1 text-[11px] text-[#9a9a9a]">
                <span>Traccia</span>
                <span>Nome</span>
                <span>Tipo traccia</span>
              </div>
              {audioTracks.map((t, i) => (
                <div key={i} className="grid grid-cols-[60px_1fr_1fr] items-center px-2 py-1 text-[12px]">
                  <span>A{i + 1}</span>
                  <span>Audio {i + 1}</span>
                  <PSelect value={t} options={["Standard", "Mono", "5.1", "Adattivo"]} onChange={(v) => setAudioTracks((a) => a.map((x, k) => (k === i ? v : x)))} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Informazioni VR" && (
          <div className="space-y-3">
            <Row label="Proiezione:">
              <PSelect value="Nessuna" options={["Nessuna", "Equirettangolare"]} onChange={() => {}} className="w-56" />
            </Row>
            <p className="text-[12px] text-[#9a9a9a]">Serve solo per i video a 360°. Per un video normale lascia &quot;Nessuna&quot;.</p>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-[#111] bg-[#2b2b2b] px-4 py-3">
        {error && <p className="rounded-[4px] border border-[#d7373f]/60 bg-[#d7373f]/15 px-2 py-1.5 text-[12px] text-[#ff9a9a]">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 text-[12px] text-[#9a9a9a]">
            Nome sequenza:
            <input value={name} onChange={(e) => setName(e.target.value)} className={clsx(P.field, "min-w-0 flex-1")} onKeyDown={(e) => e.stopPropagation()} />
          </label>
          <div className="flex gap-2">
            {onCancel && <PButton onClick={onCancel}>Annulla</PButton>}
            <PButton primary onClick={() => onConfirm({ name: name.trim() || "Sequenza 01", width, height, fps })}>
              OK
            </PButton>
          </div>
        </div>
      </div>
    </div>
  );
}
