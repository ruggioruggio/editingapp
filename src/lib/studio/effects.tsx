import type { CSSProperties, ReactNode } from "react";
import { prop, uid, valueAt, type Prop } from "./anim";

// Catalogo di effetti e transizioni condiviso dai due simulatori. Ogni effetto
// ha i suoi parametri (animabili) e una funzione che lo traduce in filtri CSS,
// filtri SVG, trasformazioni, maschere o livelli sovrapposti: così si vede
// davvero il risultato nel monitor.

export type ParamType = "number" | "angle" | "percent" | "color" | "point" | "checkbox" | "select";

export interface ParamDef {
  id: string;
  name: string;
  type: ParamType;
  default: number[] | ((w: number, h: number) => number[]);
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  options?: string[];
  /** non animabile (es. un menu) */
  static?: boolean;
  /** nomi inglesi usati nelle espressioni, es. effect("Slider Control")("Slider") */
  aliases?: string[];
}

export interface FxCtx {
  w: number;
  h: number;
  t: number;
  fps: number;
  id: string;
  name: string;
  timecode: string;
  /** contesto per le espressioni sui parametri (After Effects) */
  host?: { project: unknown; comp: unknown; layerId: string; effectIndex?: number };
}

export interface FxOut {
  filter: string[];
  svg: ReactNode[];
  transform: string[];
  clip?: string;
  mask: string[];
  overlays: ReactNode[];
  opacity: number;
  echo?: { count: number; delay: number; decay: number };
  time?: (t: number) => number;
  /** prospettiva per gli effetti 3D */
  perspective?: number;
  /** Specchio: 0 sinistra→destra, 1 destra→sinistra, 2 alto→basso, 3 basso→alto */
  mirror?: number;
}

export type Category =
  | "Canale"
  | "Correzione colore"
  | "Distorsione"
  | "Disturbo e granulosità"
  | "Genera"
  | "Keying"
  | "Prospettiva"
  | "Regolazione"
  | "Sfocatura e nitidezza"
  | "Stilizza"
  | "Tempo"
  | "Trasforma"
  | "Transizione"
  | "Utilità"
  | "Video"
  | "Controlli per espressioni";

export interface EffectDef {
  id: string;
  name: string;
  category: Category;
  /** effetto audio di Premiere */
  audio?: boolean;
  /** dove compare: entrambi se assente */
  only?: "pr" | "ae";
  params: ParamDef[];
  render?: (p: Record<string, number[]>, c: FxCtx, out: FxOut) => void;
  aliases?: string[];
}

export interface EffectInstance {
  id: string;
  defId: string;
  enabled: boolean;
  params: Record<string, Prop>;
  open?: boolean;
}

// ---- utilità -----------------------------------------------------------------

const num = (id: string, name: string, def: number, min = -10000, max = 10000, step = 1, suffix = ""): ParamDef => ({ id, name, type: "number", default: [def], min, max, step, suffix });
const pct = (id: string, name: string, def: number, max = 100): ParamDef => ({ id, name, type: "percent", default: [def], min: 0, max, step: 0.5, suffix: " %" });
const ang = (id: string, name: string, def: number): ParamDef => ({ id, name, type: "angle", default: [def], min: -36000, max: 36000, step: 1, suffix: "°" });
const col = (id: string, name: string, hex: string): ParamDef => ({ id, name, type: "color", default: hexToRgb(hex) });
const pt = (id: string, name: string, fx: number, fy: number): ParamDef => ({ id, name, type: "point", default: (w, h) => [w * fx, h * fy] });
const chk = (id: string, name: string, def = false): ParamDef => ({ id, name, type: "checkbox", default: [def ? 1 : 0], static: true });
const sel = (id: string, name: string, options: string[], def = 0): ParamDef => ({ id, name, type: "select", default: [def], options, static: true });

export function hexToRgb(hex: string): number[] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
export const rgbToHex = (c: number[]) => "#" + c.slice(0, 3).map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
const rgba = (c: number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

const matrix = (rows: number[][]) => rows.map((r) => r.join(" ")).join(" ");

function fid(c: FxCtx, name: string) {
  return `${c.id}-${name}`.replace(/[^a-zA-Z0-9_-]/g, "");
}

function svgFilter(out: FxOut, id: string, children: ReactNode, attrs: Record<string, string | number> = {}) {
  out.svg.push(
    <filter key={id} id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB" {...attrs}>
      {children}
    </filter>,
  );
  out.filter.push(`url(#${id})`);
}

/** Matrice 3D che porta il rettangolo w×h nei quattro angoli dati (Fissaggio angolo). */
function cornerPin(w: number, h: number, p: number[][]) {
  const [x0, y0] = p[0];
  const [x1, y1] = p[1];
  const [x2, y2] = p[2];
  const [x3, y3] = p[3];
  const dx1 = x1 - x3;
  const dx2 = x2 - x3;
  const dy1 = y1 - y3;
  const dy2 = y2 - y3;
  const sx = x0 - x1 + x3 - x2;
  const sy = y0 - y1 + y3 - y2;
  const den = dx1 * dy2 - dx2 * dy1 || 1e-6;
  const g = (sx * dy2 - dx2 * sy) / den;
  const hh = (dx1 * sy - sx * dy1) / den;
  const a = x1 - x0 + g * x1;
  const b = x2 - x0 + hh * x2;
  const d = y1 - y0 + g * y1;
  const e = y2 - y0 + hh * y2;
  // da quadrato unitario a quadrilatero, poi diviso per w e h
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, x0, y0, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(8)).join(",")})`;
}

// ---- catalogo degli effetti -------------------------------------------------------

const withAlias = (p: ParamDef, ...aliases: string[]): ParamDef => ({ ...p, aliases });

export const EFFECTS: EffectDef[] = [
  // Controlli per espressioni (solo After Effects): servono a collegare valori con effect("…")("…")
  { id: "x-slider", name: "Controllo cursore", aliases: ["Slider Control"], category: "Controlli per espressioni", only: "ae", params: [withAlias(num("slider", "Cursore", 0, -1000000, 1000000, 0.1), "Slider")] },
  { id: "x-angle", name: "Controllo angolo", aliases: ["Angle Control"], category: "Controlli per espressioni", only: "ae", params: [withAlias(ang("angle", "Angolo", 0), "Angle")] },
  { id: "x-check", name: "Controllo casella di controllo", aliases: ["Checkbox Control"], category: "Controlli per espressioni", only: "ae", params: [withAlias({ ...chk("check", "Casella di controllo"), static: false }, "Checkbox")] },
  { id: "x-color", name: "Controllo colore", aliases: ["Color Control"], category: "Controlli per espressioni", only: "ae", params: [withAlias(col("color", "Colore", "#ff0000"), "Color")] },
  { id: "x-point", name: "Controllo punto", aliases: ["Point Control"], category: "Controlli per espressioni", only: "ae", params: [withAlias(pt("point", "Punto", 0.5, 0.5), "Point")] },

  // Regolazione / Correzione colore
  {
    id: "lumetri",
    name: "Lumetri Color",
    category: "Correzione colore",
    params: [
      num("exposure", "Esposizione", 0, -5, 5, 0.05),
      num("contrast", "Contrasto", 0, -100, 100),
      num("highlights", "Luci", 0, -100, 100),
      num("shadows", "Ombre", 0, -100, 100),
      num("temperature", "Temperatura", 0, -100, 100),
      num("tint", "Tinta", 0, -100, 100),
      num("saturation", "Saturazione", 100, 0, 200),
      num("vibrance", "Vividezza", 0, -100, 100),
      num("vignette", "Vignettatura: quantità", 0, -3, 3, 0.05),
    ],
    render: (p, c, out) => {
      const exp = p.exposure[0];
      const con = p.contrast[0] + p.highlights[0] * 0.3 - p.shadows[0] * 0.3;
      out.filter.push(`brightness(${Math.pow(2, exp) * (1 + p.shadows[0] / 400)})`, `contrast(${1 + con / 100})`, `saturate(${(p.saturation[0] / 100) * (1 + p.vibrance[0] / 300)})`);
      const tmp = p.temperature[0] / 100;
      const tnt = p.tint[0] / 100;
      if (tmp || tnt) {
        const id = fid(c, "lum");
        svgFilter(
          out,
          id,
          <feColorMatrix
            type="matrix"
            values={matrix([
              [1 + tmp * 0.25 + tnt * 0.1, 0, 0, 0, 0],
              [0, 1 - tnt * 0.2 + tmp * 0.03, 0, 0, 0],
              [0, 0, 1 - tmp * 0.25 + tnt * 0.1, 0, 0],
              [0, 0, 0, 1, 0],
            ])}
          />,
        );
      }
      const v = p.vignette[0];
      if (v) {
        out.overlays.push(
          <div
            key={c.id + "vig"}
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at center, transparent 45%, ${v < 0 ? `rgba(0,0,0,${Math.min(1, -v / 3)})` : `rgba(255,255,255,${Math.min(1, v / 3)})`} 100%)` }}
          />,
        );
      }
    },
  },
  {
    id: "brightness",
    name: "Luminosità e contrasto",
    category: "Correzione colore",
    params: [num("b", "Luminosità", 0, -100, 100), num("c", "Contrasto", 0, -100, 100)],
    render: (p, _c, out) => out.filter.push(`brightness(${1 + p.b[0] / 100})`, `contrast(${1 + p.c[0] / 100})`),
  },
  {
    id: "bw",
    name: "Bianco e nero",
    category: "Correzione colore",
    params: [],
    render: (_p, _c, out) => out.filter.push("grayscale(1)"),
  },
  {
    id: "tint",
    name: "Tinta",
    category: "Correzione colore",
    params: [col("black", "Mappa nero a", "#000000"), col("white", "Mappa bianco a", "#ffffff"), pct("amount", "Quantità tinta", 100)],
    render: (p, c, out) => {
      const a = p.amount[0] / 100;
      const [b, w] = [p.black.map((x) => x / 255), p.white.map((x) => x / 255)];
      const L = [0.299, 0.587, 0.114];
      const row = (i: number) => [...L.map((l, k) => (1 - a) * (i === k ? 1 : 0) + a * l * (w[i] - b[i])), 0, a * b[i]];
      svgFilter(out, fid(c, "tint"), <feColorMatrix type="matrix" values={matrix([row(0), row(1), row(2), [0, 0, 0, 1, 0]])} />);
    },
  },
  {
    id: "hls",
    name: "Bilanciamento colore (HLS)",
    category: "Correzione colore",
    params: [ang("hue", "Tonalità", 0), num("light", "Luminosità", 0, -100, 100), num("sat", "Saturazione", 0, -100, 100)],
    render: (p, _c, out) => out.filter.push(`hue-rotate(${p.hue[0]}deg)`, `brightness(${1 + p.light[0] / 100})`, `saturate(${1 + p.sat[0] / 100})`),
  },
  {
    id: "levels",
    name: "Livelli",
    category: "Regolazione",
    params: [num("inB", "Input nero", 0, 0, 255), num("inW", "Input bianco", 255, 0, 255), num("gamma", "Gamma", 1, 0.1, 5, 0.01), num("outB", "Output nero", 0, 0, 255), num("outW", "Output bianco", 255, 0, 255)],
    render: (p, c, out) => {
      const ib = p.inB[0] / 255;
      const iw = Math.max(ib + 0.01, p.inW[0] / 255);
      const slope = 1 / (iw - ib);
      const ob = p.outB[0] / 255;
      const ow = p.outW[0] / 255;
      const f = (k: string) => (
        <>
          <feComponentTransfer key={k + "1"} result={"l1" + k}>
            <feFuncR type="linear" slope={slope} intercept={-ib * slope} />
            <feFuncG type="linear" slope={slope} intercept={-ib * slope} />
            <feFuncB type="linear" slope={slope} intercept={-ib * slope} />
          </feComponentTransfer>
          <feComponentTransfer key={k + "2"}>
            <feFuncR type="gamma" amplitude={ow - ob} exponent={1 / p.gamma[0]} offset={ob} />
            <feFuncG type="gamma" amplitude={ow - ob} exponent={1 / p.gamma[0]} offset={ob} />
            <feFuncB type="gamma" amplitude={ow - ob} exponent={1 / p.gamma[0]} offset={ob} />
          </feComponentTransfer>
        </>
      );
      svgFilter(out, fid(c, "lev"), f("a"));
    },
  },
  {
    id: "fill",
    name: "Riempi",
    category: "Genera",
    params: [col("color", "Colore", "#ff0000"), chk("invert", "Inverti"), pct("opacity", "Opacità", 100)],
    render: (p, c, out) => {
      svgFilter(
        out,
        fid(c, "fill"),
        <>
          <feFlood floodColor={rgbToHex(p.color)} floodOpacity={p.opacity[0] / 100} result="f" />
          <feComposite in="f" in2="SourceAlpha" operator={p.invert[0] ? "out" : "in"} result="c" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="c" />
          </feMerge>
        </>,
      );
    },
  },
  {
    id: "invert",
    name: "Inverti",
    category: "Canale",
    params: [pct("blend", "Fusione con originale", 0)],
    render: (p, _c, out) => out.filter.push(`invert(${1 - p.blend[0] / 100})`),
  },
  {
    id: "channelmix",
    name: "Mescolatore canali",
    category: "Canale",
    params: [num("rr", "Rosso-Rosso", 100, -200, 200), num("rg", "Rosso-Verde", 0, -200, 200), num("rb", "Rosso-Blu", 0, -200, 200), num("gg", "Verde-Verde", 100, -200, 200), num("bb", "Blu-Blu", 100, -200, 200), chk("mono", "Monocromatico")],
    render: (p, c, out) => {
      const v = (k: string) => p[k][0] / 100;
      const r = [v("rr"), v("rg"), v("rb"), 0, 0];
      const rows = p.mono[0] ? [r, r, r] : [r, [0, v("gg"), 0, 0, 0], [0, 0, v("bb"), 0, 0]];
      svgFilter(out, fid(c, "cm"), <feColorMatrix type="matrix" values={matrix([...rows, [0, 0, 0, 1, 0]])} />);
    },
  },

  // Sfocatura e nitidezza
  {
    id: "gaussian",
    name: "Sfocatura gaussiana",
    aliases: ["Gaussian Blur"],
    category: "Sfocatura e nitidezza",
    params: [withAlias(num("blur", "Sfocatura", 0, 0, 1000, 0.5), "Blurriness"), sel("dim", "Dimensioni sfocatura", ["Orizzontale e verticale", "Orizzontale", "Verticale"]), chk("repeat", "Ripeti pixel bordi")],
    render: (p, c, out) => {
      const b = p.blur[0] / 2;
      if (!b) return;
      const d = p.dim[0];
      svgFilter(out, fid(c, "gb"), <feGaussianBlur stdDeviation={`${d === 2 ? 0 : b} ${d === 1 ? 0 : b}`} edgeMode={p.repeat[0] ? "duplicate" : "none"} />);
    },
  },
  {
    id: "dirblur",
    name: "Sfocatura direzionale",
    category: "Sfocatura e nitidezza",
    params: [ang("dir", "Direzione", 0), num("len", "Lunghezza sfocatura", 0, 0, 1000)],
    render: (p, c, out) => {
      const L = p.len[0] / 2;
      if (!L) return;
      const a = (p.dir[0] * Math.PI) / 180;
      svgFilter(out, fid(c, "db"), <feGaussianBlur stdDeviation={`${Math.abs(Math.sin(a)) * L} ${Math.abs(Math.cos(a)) * L}`} />);
    },
  },
  {
    id: "camblur",
    name: "Sfocatura fotocamera",
    category: "Sfocatura e nitidezza",
    params: [pct("amount", "Percentuale di sfocatura", 0)],
    render: (p, _c, out) => p.amount[0] && out.filter.push(`blur(${p.amount[0] / 4}px)`),
  },
  {
    id: "sharpen",
    name: "Nitidezza",
    category: "Sfocatura e nitidezza",
    params: [num("amount", "Quantità nitidezza", 0, 0, 500)],
    render: (p, c, out) => {
      const k = p.amount[0] / 100;
      if (!k) return;
      svgFilter(out, fid(c, "sh"), <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix={`0 ${-k} 0 ${-k} ${1 + 4 * k} ${-k} 0 ${-k} 0`} />);
    },
  },

  // Distorsione / Trasforma
  {
    id: "transform",
    name: "Trasforma",
    category: "Distorsione",
    params: [pt("anchor", "Punto di ancoraggio", 0.5, 0.5), pt("pos", "Posizione", 0.5, 0.5), num("scale", "Scala", 100, -10000, 10000, 0.5), ang("skew", "Inclinazione", 0), ang("rot", "Rotazione", 0), pct("op", "Opacità", 100)],
    render: (p, c, out) => {
      const dx = p.pos[0] - p.anchor[0];
      const dy = p.pos[1] - p.anchor[1];
      out.transform.push(`translate(${dx}px, ${dy}px)`, `rotate(${p.rot[0]}deg)`, `skewX(${p.skew[0]}deg)`, `scale(${p.scale[0] / 100})`);
      out.opacity *= p.op[0] / 100;
      void c;
    },
  },
  {
    id: "hflip",
    name: "Capovolgi orizzontalmente",
    category: "Trasforma",
    params: [],
    render: (_p, _c, out) => out.transform.push("scaleX(-1)"),
  },
  {
    id: "vflip",
    name: "Capovolgi verticalmente",
    category: "Trasforma",
    params: [],
    render: (_p, _c, out) => out.transform.push("scaleY(-1)"),
  },
  {
    id: "crop",
    name: "Ritaglia",
    category: "Trasforma",
    params: [pct("l", "Sinistra", 0), pct("t", "In alto", 0), pct("r", "Destra", 0), pct("b", "In basso", 0), chk("zoom", "Zoom")],
    render: (p, c, out) => {
      out.clip = `inset(${p.t[0]}% ${p.r[0]}% ${p.b[0]}% ${p.l[0]}%)`;
      if (p.zoom[0]) {
        const sx = 100 / Math.max(1, 100 - p.l[0] - p.r[0]);
        const sy = 100 / Math.max(1, 100 - p.t[0] - p.b[0]);
        out.transform.push(`translate(${((p.r[0] - p.l[0]) / 200) * c.w * sx}px, ${((p.b[0] - p.t[0]) / 200) * c.h * sy}px)`, `scale(${sx}, ${sy})`);
      }
    },
  },
  {
    id: "feather",
    name: "Sfuma bordi",
    category: "Trasforma",
    params: [num("amount", "Quantità", 0, 0, 100)],
    render: (p, _c, out) => {
      const a = p.amount[0] / 2;
      if (a) out.mask.push(`linear-gradient(to right, transparent, black ${a}%, black ${100 - a}%, transparent)`, `linear-gradient(to bottom, transparent, black ${a}%, black ${100 - a}%, transparent)`);
    },
  },
  {
    id: "cornerpin",
    name: "Fissaggio angolo",
    category: "Distorsione",
    params: [pt("ul", "In alto a sinistra", 0, 0), pt("ur", "In alto a destra", 1, 0), pt("ll", "In basso a sinistra", 0, 1), pt("lr", "In basso a destra", 1, 1)],
    render: (p, c, out) => {
      out.transform.push(`translate(${-c.w / 2}px, ${-c.h / 2}px)`, cornerPin(c.w, c.h, [p.ul, p.ur, p.ll, p.lr]), `translate(${c.w / 2}px, ${c.h / 2}px)`);
    },
  },
  {
    id: "turbulent",
    name: "Spostamento turbolento",
    category: "Distorsione",
    params: [num("amount", "Quantità", 50, -1000, 1000), num("size", "Dimensione", 100, 2, 1000), num("evolution", "Evoluzione", 0, -36000, 36000)],
    render: (p, c, out) => {
      if (!p.amount[0]) return;
      svgFilter(
        out,
        fid(c, "tu"),
        <>
          <feTurbulence type="fractalNoise" baseFrequency={1 / p.size[0]} numOctaves={2} seed={Math.floor(p.evolution[0] / 30)} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={p.amount[0]} xChannelSelector="R" yChannelSelector="G" />
        </>,
      );
    },
  },
  {
    id: "wave",
    name: "Distorsione onda",
    category: "Distorsione",
    params: [num("height", "Altezza onda", 10, -1000, 1000), num("width", "Larghezza onda", 40, 1, 2000), num("speed", "Velocità onda", 1, -10, 10, 0.1)],
    render: (p, c, out) => {
      if (!p.height[0]) return;
      svgFilter(
        out,
        fid(c, "wv"),
        <>
          <feTurbulence type="turbulence" baseFrequency={`${1 / (p.width[0] * 6)} ${1 / p.width[0]}`} numOctaves={1} seed={Math.floor(c.t * p.speed[0] * 4)} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={p.height[0] * 2} xChannelSelector="R" yChannelSelector="G" />
        </>,
      );
    },
  },
  {
    id: "lens",
    name: "Distorsione lente",
    category: "Distorsione",
    params: [num("curve", "Curvatura", 0, -100, 100)],
    render: (p, c, out) => {
      const k = p.curve[0];
      if (!k) return;
      svgFilter(
        out,
        fid(c, "ld"),
        <>
          <feTurbulence type="fractalNoise" baseFrequency="0.001" numOctaves={1} seed={3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={k * 2} xChannelSelector="R" yChannelSelector="B" />
        </>,
      );
      out.transform.push(`scale(${1 - k / 600})`);
    },
  },
  {
    id: "mirror",
    name: "Specchio",
    category: "Distorsione",
    params: [sel("side", "Lato riflesso", ["Sinistra su destra", "Destra su sinistra", "Alto su basso", "Basso su alto"])],
    render: (p, _c, out) => {
      // il livello mostra la metà scelta e accanto la sua copia riflessa
      out.mirror = p.side[0];
    },
  },

  // Disturbo e granulosità
  {
    id: "noise",
    name: "Disturbo",
    category: "Disturbo e granulosità",
    params: [pct("amount", "Quantità di disturbo", 0), chk("color", "Disturbo colore", true)],
    render: (p, c, out) => {
      const a = p.amount[0] / 100;
      if (!a) return;
      svgFilter(
        out,
        fid(c, "nz"),
        <>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={Math.floor(c.t * c.fps)} result="n" />
          {!p.color[0] && <feColorMatrix in="n" type="saturate" values="0" result="n" />}
          <feComposite in="n" in2="SourceGraphic" operator="arithmetic" k1={0} k2={a} k3={1 - a * 0.5} k4={-a * 0.25} result="m" />
          <feComposite in="m" in2="SourceAlpha" operator="in" />
        </>,
      );
    },
  },
  {
    id: "grain",
    name: "Aggiungi granulosità",
    category: "Disturbo e granulosità",
    params: [num("intensity", "Intensità", 1, 0, 10, 0.05), num("size", "Dimensione", 1, 0.2, 5, 0.05)],
    render: (p, c, out) => {
      const a = Math.min(1, p.intensity[0] * 0.15);
      if (!a) return;
      svgFilter(
        out,
        fid(c, "gr"),
        <>
          <feTurbulence type="fractalNoise" baseFrequency={0.8 / p.size[0]} numOctaves={2} seed={Math.floor(c.t * c.fps)} result="n" />
          <feColorMatrix in="n" type="saturate" values="0" result="g" />
          <feComposite in="g" in2="SourceGraphic" operator="arithmetic" k1={0} k2={a} k3={1} k4={-a / 2} result="m" />
          <feComposite in="m" in2="SourceAlpha" operator="in" />
        </>,
      );
    },
  },
  {
    id: "median",
    name: "Mediana",
    category: "Disturbo e granulosità",
    params: [num("radius", "Raggio", 0, 0, 100)],
    render: (p, _c, out) => p.radius[0] && out.filter.push(`blur(${p.radius[0] / 3}px)`, "contrast(1.1)"),
  },

  // Genera
  {
    id: "ramp",
    name: "Rampa di gradiente",
    category: "Genera",
    params: [pt("start", "Inizio della rampa", 0.5, 0), col("c1", "Colore iniziale", "#000000"), pt("end", "Fine della rampa", 0.5, 1), col("c2", "Colore finale", "#ffffff"), sel("shape", "Forma rampa", ["Rampa lineare", "Rampa radiale"]), pct("blend", "Fusione con originale", 0)],
    render: (p, c, out) => {
      const [x1, y1] = p.start;
      const [x2, y2] = p.end;
      const bg =
        p.shape[0] === 1
          ? `radial-gradient(circle ${Math.hypot(x2 - x1, y2 - y1)}px at ${x1}px ${y1}px, ${rgba(p.c1)}, ${rgba(p.c2)})`
          : `linear-gradient(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 90}deg, ${rgba(p.c1)}, ${rgba(p.c2)})`;
      out.overlays.push(<div key={c.id + "ramp"} className="pointer-events-none absolute inset-0" style={{ background: bg, opacity: 1 - p.blend[0] / 100 }} />);
    },
  },
  {
    id: "fourcolor",
    name: "Riempimento a 4 colori",
    category: "Genera",
    params: [col("c1", "Colore 1", "#ffff00"), col("c2", "Colore 2", "#00ff00"), col("c3", "Colore 3", "#ff00ff"), col("c4", "Colore 4", "#0000ff"), pct("op", "Opacità", 100), sel("mode", "Metodo fusione", ["Nessuno", "Normale", "Sovrapponi", "Moltiplica", "Schermo"], 1)],
    render: (p, c, out) => {
      const m = ["normal", "normal", "overlay", "multiply", "screen"][p.mode[0]] as CSSProperties["mixBlendMode"];
      out.overlays.push(
        <div
          key={c.id + "4c"}
          className="pointer-events-none absolute inset-0"
          style={{
            mixBlendMode: m,
            opacity: p.op[0] / 100,
            background: `radial-gradient(circle at 15% 15%, ${rgba(p.c1)}, transparent 60%), radial-gradient(circle at 85% 15%, ${rgba(p.c2)}, transparent 60%), radial-gradient(circle at 15% 85%, ${rgba(p.c3)}, transparent 60%), radial-gradient(circle at 85% 85%, ${rgba(p.c4)}, transparent 60%)`,
          }}
        />,
      );
    },
  },
  {
    id: "flare",
    name: "Riflesso lente",
    category: "Genera",
    params: [pt("center", "Centro bagliore", 0.25, 0.25), num("bright", "Luminosità bagliore", 100, 0, 300), sel("type", "Tipo di lente", ["Zoom 50-300 mm", "Fisso 35 mm", "Fisso 105 mm"])],
    render: (p, c, out) => {
      const [x, y] = p.center;
      const b = p.bright[0] / 100;
      const cx = c.w / 2;
      const cy = c.h / 2;
      const rings = [0.4, 0.8, 1.3, 1.7].map((f, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: x + (cx - x) * f * 2 - 30 * (i + 1),
            top: y + (cy - y) * f * 2 - 30 * (i + 1),
            width: 60 * (i + 1),
            height: 60 * (i + 1),
            background: `radial-gradient(circle, rgba(${[255, 180, 120, 160][i]},${[220, 200, 255, 255][i]},${[180, 255, 200, 140][i]},${0.25 * b}), transparent 70%)`,
          }}
        />
      ));
      out.overlays.push(
        <div key={c.id + "fl"} className="pointer-events-none absolute inset-0 overflow-hidden" style={{ mixBlendMode: "screen" }}>
          <div className="absolute rounded-full" style={{ left: x - 300 * b, top: y - 300 * b, width: 600 * b, height: 600 * b, background: `radial-gradient(circle, rgba(255,255,240,${Math.min(1, b)}) 0%, rgba(255,200,120,${0.5 * b}) 15%, transparent 60%)` }} />
          <div className="absolute" style={{ left: 0, top: y - 2, width: c.w, height: 4, background: `linear-gradient(90deg, transparent, rgba(255,220,180,${0.5 * b}) ${(x / c.w) * 100}%, transparent)` }} />
          {rings}
        </div>,
      );
    },
  },
  {
    id: "grid",
    name: "Griglia",
    category: "Genera",
    params: [num("size", "Dimensione", 100, 2, 2000), num("border", "Bordo", 3, 0, 200), col("color", "Colore", "#ffffff"), pct("op", "Opacità", 100)],
    render: (p, c, out) => {
      const s = p.size[0];
      const b = p.border[0];
      const color = rgba(p.color, p.op[0] / 100);
      out.overlays.push(
        <div
          key={c.id + "grid"}
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: `linear-gradient(${color} ${b}px, transparent ${b}px), linear-gradient(90deg, ${color} ${b}px, transparent ${b}px)`, backgroundSize: `${s}px ${s}px` }}
        />,
      );
    },
  },
  {
    id: "circle",
    name: "Cerchio",
    category: "Genera",
    params: [pt("center", "Centro", 0.5, 0.5), num("radius", "Raggio", 100, 0, 5000), num("edge", "Sfumatura bordo", 0, 0, 500), col("color", "Colore", "#ffffff"), pct("op", "Opacità", 100)],
    render: (p, c, out) => {
      const r = p.radius[0];
      out.overlays.push(
        <div
          key={c.id + "circ"}
          className="pointer-events-none absolute inset-0"
          style={{ opacity: p.op[0] / 100, background: `radial-gradient(circle ${r + p.edge[0]}px at ${p.center[0]}px ${p.center[1]}px, ${rgba(p.color)} ${(r / (r + p.edge[0] || 1)) * 100}%, transparent 100%)` }}
        />,
      );
    },
  },
  {
    id: "checker",
    name: "Scacchiera",
    category: "Genera",
    params: [num("size", "Dimensione", 64, 2, 2000), col("color", "Colore", "#ffffff"), pct("op", "Opacità", 100)],
    render: (p, c, out) => {
      const s = p.size[0];
      out.overlays.push(
        <div
          key={c.id + "chk"}
          className="pointer-events-none absolute inset-0"
          style={{ opacity: p.op[0] / 100, backgroundImage: `conic-gradient(${rgba(p.color)} 25%, transparent 0 50%, ${rgba(p.color)} 0 75%, transparent 0)`, backgroundSize: `${s * 2}px ${s * 2}px` }}
        />,
      );
    },
  },

  // Keying
  {
    id: "ultrakey",
    name: "Ultra Key",
    category: "Keying",
    params: [col("key", "Colore chiave", "#00b140"), num("tol", "Tolleranza", 50, 0, 100), num("soft", "Morbidezza", 10, 0, 100), chk("spill", "Riduzione dispersione", true)],
    render: (p, c, out) => {
      // canale alfa = 1 - k·(crominanza del pixel nella direzione del colore chiave)
      const kc = p.key.map((x) => x / 255);
      const mean = (kc[0] + kc[1] + kc[2]) / 3;
      const d = kc.map((x) => x - mean);
      const len = Math.hypot(...d) || 1;
      const k = (2 + p.tol[0] / 10) / len / Math.max(0.3, 1 - p.soft[0] / 120);
      const alpha = [-d[0] * k, -d[1] * k, -d[2] * k, 0, 1 + 0.15 * k * len - p.tol[0] / 400];
      const spill = p.spill[0] && d[1] > 0;
      svgFilter(
        out,
        fid(c, "uk"),
        <>
          <feColorMatrix
            type="matrix"
            values={matrix([
              [1, 0, 0, 0, 0],
              spill ? [0.5, 0, 0.5, 0, 0] : [0, 1, 0, 0, 0],
              [0, 0, 1, 0, 0],
              alpha,
            ])}
          />
        </>,
      );
    },
  },
  {
    id: "lumakey",
    name: "Chiave luminanza",
    category: "Keying",
    params: [num("threshold", "Soglia", 30, 0, 100), num("cutoff", "Interruzione", 10, 0, 100)],
    render: (p, c, out) => {
      const k = 1 / Math.max(0.02, (p.threshold[0] - p.cutoff[0]) / 100 + 0.05);
      svgFilter(out, fid(c, "lk"), <feColorMatrix type="matrix" values={matrix([[1, 0, 0, 0, 0], [0, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0.299 * k, 0.587 * k, 0.114 * k, 0, (-p.cutoff[0] / 100) * k]])} />);
    },
  },

  // Prospettiva
  {
    id: "shadow",
    name: "Ombra esterna",
    category: "Prospettiva",
    params: [col("color", "Colore ombra", "#000000"), pct("op", "Opacità", 50), ang("dir", "Direzione", 135), num("dist", "Distanza", 10, 0, 4000), num("soft", "Morbidezza", 10, 0, 250)],
    render: (p, _c, out) => {
      const a = ((p.dir[0] - 90) * Math.PI) / 180;
      out.filter.push(`drop-shadow(${Math.cos(a) * p.dist[0]}px ${Math.sin(a) * p.dist[0]}px ${p.soft[0] / 2}px ${rgba(p.color, p.op[0] / 100)})`);
    },
  },
  {
    id: "basic3d",
    name: "Prospettiva base 3D",
    category: "Prospettiva",
    params: [ang("swivel", "Rotazione orizzontale", 0), ang("tilt", "Inclinazione", 0), num("dist", "Distanza dall'immagine", 0, -99, 99)],
    render: (p, _c, out) => {
      out.perspective = 1800;
      out.transform.push(`translateZ(${-p.dist[0] * 10}px)`, `rotateY(${p.swivel[0]}deg)`, `rotateX(${-p.tilt[0]}deg)`);
    },
  },
  {
    id: "bevel",
    name: "Smussa bordi",
    category: "Prospettiva",
    params: [num("thick", "Spessore bordo", 10, 0, 100), num("light", "Intensità luce", 40, 0, 100)],
    render: (p, c, out) => {
      const t = (p.thick[0] / 100) * Math.min(c.w, c.h) * 0.2;
      const l = p.light[0] / 100;
      out.overlays.push(<div key={c.id + "bev"} className="pointer-events-none absolute inset-0" style={{ boxShadow: `inset ${t}px ${t}px ${t}px rgba(255,255,255,${l}), inset ${-t}px ${-t}px ${t}px rgba(0,0,0,${l})` }} />);
    },
  },

  // Stilizza
  {
    id: "mosaic",
    name: "Mosaico",
    category: "Stilizza",
    params: [num("h", "Blocchi orizzontali", 10, 1, 4000), num("v", "Blocchi verticali", 10, 1, 4000)],
    render: (p, c, out) => {
      const bw = Math.max(2, c.w / p.h[0]);
      const bh = Math.max(2, c.h / p.v[0]);
      const s = Math.max(bw, bh);
      const id = fid(c, "mo");
      out.svg.push(
        <filter key={id} id={id} x="0" y="0" width="1" height="1" primitiveUnits="userSpaceOnUse">
          <feFlood x={s / 2} y={s / 2} width="1" height="1" />
          <feComposite width={s} height={s} />
          <feTile result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
          <feMorphology operator="dilate" radius={s / 2} />
        </filter>,
      );
      out.filter.push(`url(#${id})`);
    },
  },
  {
    id: "glow",
    name: "Bagliore",
    category: "Stilizza",
    params: [pct("threshold", "Soglia bagliore", 60), num("radius", "Raggio bagliore", 10, 0, 1000), num("intensity", "Intensità bagliore", 1, 0, 10, 0.05), col("color", "Colore", "#fff2c8")],
    render: (p, _c, out) => {
      const r = p.radius[0];
      const i = p.intensity[0];
      if (!r || !i) return;
      const c = rgba(p.color, Math.min(1, 0.4 * i * (1 - p.threshold[0] / 200)));
      out.filter.push(`drop-shadow(0 0 ${r / 2}px ${c})`, `drop-shadow(0 0 ${r}px ${c})`, `brightness(${1 + i * 0.05})`);
    },
  },
  {
    id: "edges",
    name: "Trova bordi",
    category: "Stilizza",
    params: [chk("invert", "Inverti"), pct("blend", "Fusione con originale", 0)],
    render: (p, c, out) => {
      const b = p.blend[0] / 100;
      svgFilter(
        out,
        fid(c, "ed"),
        <>
          <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" result="e" />
          {!p.invert[0] && (
            <feComponentTransfer in="e" result="e">
              <feFuncR type="linear" slope={-1} intercept={1} />
              <feFuncG type="linear" slope={-1} intercept={1} />
              <feFuncB type="linear" slope={-1} intercept={1} />
            </feComponentTransfer>
          )}
          <feComposite in="e" in2="SourceGraphic" operator="arithmetic" k1={0} k2={1 - b} k3={b} k4={0} />
        </>,
      );
    },
  },
  {
    id: "emboss",
    name: "Rilievo",
    category: "Stilizza",
    params: [ang("dir", "Direzione", 45), num("relief", "Rilievo", 1.5, 0, 10, 0.1)],
    render: (p, c, out) => {
      const r = p.relief[0];
      svgFilter(
        out,
        fid(c, "em"),
        <>
          <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix={`${-2 * r} ${-r} 0 ${-r} 1 ${r} 0 ${r} ${2 * r}`} bias="0.5" />
          <feColorMatrix type="saturate" values="0" />
        </>,
      );
    },
  },
  {
    id: "posterize",
    name: "Posterizza",
    category: "Stilizza",
    params: [num("levels", "Livello", 6, 2, 64)],
    render: (p, c, out) => {
      const n = Math.round(p.levels[0]);
      const tv = Array.from({ length: n }, (_, i) => (i / (n - 1)).toFixed(3)).join(" ");
      svgFilter(
        out,
        fid(c, "po"),
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues={tv} />
          <feFuncG type="discrete" tableValues={tv} />
          <feFuncB type="discrete" tableValues={tv} />
        </feComponentTransfer>,
      );
    },
  },
  {
    id: "threshold",
    name: "Soglia",
    category: "Stilizza",
    params: [num("level", "Livello", 128, 0, 255)],
    render: (p, c, out) => {
      const l = p.level[0] / 255;
      const tv = Array.from({ length: 20 }, (_, i) => (i / 19 < l ? 0 : 1)).join(" ");
      svgFilter(
        out,
        fid(c, "th"),
        <>
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues={tv} />
            <feFuncG type="discrete" tableValues={tv} />
            <feFuncB type="discrete" tableValues={tv} />
          </feComponentTransfer>
        </>,
      );
    },
  },
  {
    id: "strobe",
    name: "Luce stroboscopica",
    category: "Stilizza",
    params: [col("color", "Colore stroboscopico", "#ffffff"), num("period", "Periodo stroboscopico (secondi)", 0.5, 0.05, 30, 0.05), num("dur", "Durata stroboscopica (secondi)", 0.1, 0.01, 30, 0.01)],
    render: (p, c, out) => {
      if (c.t % p.period[0] < p.dur[0]) out.overlays.push(<div key={c.id + "st"} className="pointer-events-none absolute inset-0" style={{ background: rgba(p.color) }} />);
    },
  },
  {
    id: "scatter",
    name: "Dispersione",
    category: "Stilizza",
    params: [num("amount", "Quantità dispersione", 20, 0, 127)],
    render: (p, c, out) => {
      if (!p.amount[0]) return;
      svgFilter(
        out,
        fid(c, "sc"),
        <>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={1} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={p.amount[0]} xChannelSelector="R" yChannelSelector="G" />
        </>,
      );
    },
  },

  // Tempo
  {
    id: "postertime",
    name: "Posterizza tempo",
    category: "Tempo",
    params: [num("fps", "Frequenza fotogrammi", 12, 1, 99)],
    render: (p, _c, out) => {
      const f = p.fps[0];
      out.time = (t) => Math.floor(t * f) / f;
    },
  },
  {
    id: "echo",
    name: "Eco",
    category: "Tempo",
    params: [num("delay", "Ritardo eco (secondi)", -0.05, -10, 10, 0.01), num("count", "Numero di echi", 3, 0, 20), num("decay", "Decadimento", 0.6, 0, 1, 0.01)],
    render: (p, _c, out) => {
      out.echo = { count: Math.round(p.count[0]), delay: p.delay[0], decay: p.decay[0] };
    },
  },

  // Transizione (come effetti)
  {
    id: "linearwipe",
    name: "Tendina lineare",
    category: "Transizione",
    params: [pct("done", "Completamento transizione", 0), ang("angle", "Angolo tendina", 90), num("feather", "Sfumatura", 0, 0, 2000)],
    render: (p, c, out) => {
      const d = p.done[0];
      if (!d) return;
      const f = (p.feather[0] / Math.max(c.w, c.h)) * 100;
      out.mask.push(`linear-gradient(${p.angle[0]}deg, transparent ${d - f / 2}%, black ${d + f / 2}%)`);
    },
  },
  {
    id: "radialwipe",
    name: "Tendina radiale",
    category: "Transizione",
    params: [pct("done", "Completamento transizione", 0), ang("start", "Angolo iniziale", 0), pt("center", "Centro tendina", 0.5, 0.5)],
    render: (p, c, out) => {
      const d = p.done[0];
      if (!d) return;
      out.mask.push(`conic-gradient(from ${p.start[0]}deg at ${p.center[0]}px ${p.center[1]}px, transparent ${d * 3.6}deg, black ${d * 3.6}deg)`);
      void c;
    },
  },
  {
    id: "venetian",
    name: "Tendine veneziane",
    category: "Transizione",
    params: [pct("done", "Completamento transizione", 0), ang("dir", "Direzione", 0), num("width", "Larghezza", 40, 2, 2000)],
    render: (p, _c, out) => {
      const d = p.done[0] / 100;
      if (!d) return;
      const w = p.width[0];
      out.mask.push(`repeating-linear-gradient(${p.dir[0]}deg, transparent 0 ${w * d}px, black ${w * d}px ${w}px)`);
    },
  },
  {
    id: "iriswipe",
    name: "Tendina iris",
    category: "Transizione",
    params: [pct("done", "Completamento transizione", 0), pt("center", "Centro iris", 0.5, 0.5), num("feather", "Sfumatura", 0, 0, 500)],
    render: (p, c, out) => {
      const d = p.done[0] / 100;
      if (!d) return;
      const r = Math.hypot(c.w, c.h) * (1 - d) * 0.6;
      out.mask.push(`radial-gradient(circle at ${p.center[0]}px ${p.center[1]}px, black ${r}px, transparent ${r + p.feather[0] + 1}px)`);
    },
  },

  // Video / Utilità
  {
    id: "timecode",
    name: "Codice temporale",
    category: "Video",
    params: [pt("pos", "Posizione", 0.5, 0.9), num("size", "Dimensione", 15, 1, 100), pct("op", "Opacità riquadro", 50)],
    render: (p, c, out) => {
      const fs = (p.size[0] / 100) * c.h * 0.4;
      out.overlays.push(
        <div
          key={c.id + "tc"}
          className="pointer-events-none absolute whitespace-nowrap font-mono text-white"
          style={{ left: p.pos[0], top: p.pos[1], transform: "translate(-50%,-50%)", fontSize: fs, padding: fs * 0.15, background: `rgba(0,0,0,${p.op[0] / 100})` }}
        >
          {c.timecode}
        </div>,
      );
    },
  },
  {
    id: "clipname",
    name: "Nome clip",
    category: "Video",
    params: [pt("pos", "Posizione", 0.5, 0.15), num("size", "Dimensione", 12, 1, 100), pct("op", "Opacità riquadro", 50)],
    render: (p, c, out) => {
      const fs = (p.size[0] / 100) * c.h * 0.4;
      out.overlays.push(
        <div key={c.id + "cn"} className="pointer-events-none absolute whitespace-nowrap text-white" style={{ left: p.pos[0], top: p.pos[1], transform: "translate(-50%,-50%)", fontSize: fs, padding: fs * 0.15, background: `rgba(0,0,0,${p.op[0] / 100})` }}>
          {c.name}
        </div>,
      );
    },
  },
  {
    id: "lut",
    name: "Applica LUT colore",
    category: "Utilità",
    params: [sel("lut", "LUT", ["Nessuna", "Cinematico teal & orange", "Bianco e nero contrastato", "Pellicola calda", "Notte americana"])],
    render: (p, c, out) => {
      const v = p.lut[0];
      if (v === 1) svgFilter(out, fid(c, "lut"), <feColorMatrix type="matrix" values={matrix([[1.15, 0, -0.05, 0, 0.02], [0, 1, 0, 0, 0], [-0.05, 0.05, 1.1, 0, 0.04], [0, 0, 0, 1, 0]])} />);
      if (v === 2) out.filter.push("grayscale(1)", "contrast(1.4)");
      if (v === 3) out.filter.push("sepia(0.35)", "saturate(1.2)", "contrast(1.05)");
      if (v === 4) out.filter.push("brightness(0.55)", "hue-rotate(180deg)", "saturate(0.6)", "hue-rotate(-180deg)", "sepia(0.2)", "hue-rotate(170deg)");
    },
  },

  // Effetti audio di Premiere (agiscono sui livelli)
  { id: "a-gain", name: "Guadagno", category: "Regolazione", audio: true, only: "pr", params: [num("gain", "Guadagno", 0, -96, 30, 0.1, " dB")] },
  { id: "a-amplify", name: "Amplifica", category: "Regolazione", audio: true, only: "pr", params: [num("left", "Guadagno sinistro", 0, -96, 30, 0.1, " dB"), num("right", "Guadagno destro", 0, -96, 30, 0.1, " dB")] },
  { id: "a-reverb", name: "Riverbero studio", category: "Regolazione", audio: true, only: "pr", params: [num("size", "Dimensione stanza", 50, 0, 100), num("decay", "Decadimento", 50, 0, 100), pct("mix", "Mix", 30)] },
  { id: "a-delay", name: "Ritardo", category: "Regolazione", audio: true, only: "pr", params: [num("delay", "Ritardo", 0.5, 0, 2, 0.01, " s"), pct("feedback", "Feedback", 30), pct("mix", "Mix", 50)] },
  { id: "a-eq", name: "Equalizzatore parametrico", category: "Regolazione", audio: true, only: "pr", params: [num("low", "Bassi", 0, -30, 30, 0.1, " dB"), num("mid", "Medi", 0, -30, 30, 0.1, " dB"), num("high", "Alti", 0, -30, 30, 0.1, " dB")] },
  { id: "a-denoise", name: "DeNoise", category: "Regolazione", audio: true, only: "pr", params: [pct("amount", "Quantità", 40)] },
  { id: "a-compressor", name: "Compressore multibanda", category: "Regolazione", audio: true, only: "pr", params: [num("threshold", "Soglia", -20, -60, 0, 0.1, " dB"), num("ratio", "Rapporto", 4, 1, 30, 0.1)] },
  { id: "a-limiter", name: "Limitatore rigido", category: "Regolazione", audio: true, only: "pr", params: [num("max", "Ampiezza massima", -0.1, -20, 0, 0.1, " dB")] },
  { id: "a-balance", name: "Bilanciamento", category: "Regolazione", audio: true, only: "pr", params: [num("bal", "Bilanciamento", 0, -100, 100)] },
  { id: "a-swap", name: "Inverti canali", category: "Regolazione", audio: true, only: "pr", params: [] },
];

export const getEffect = (id: string) => EFFECTS.find((e) => e.id === id);

export function newEffect(defId: string, w: number, h: number): EffectInstance {
  const def = getEffect(defId)!;
  const params: Record<string, Prop> = {};
  for (const p of def.params) params[p.id] = prop(...(typeof p.default === "function" ? p.default(w, h) : p.default));
  return { id: uid("fx"), defId, enabled: true, params, open: true };
}

export const emptyOut = (): FxOut => ({ filter: [], svg: [], transform: [], mask: [], overlays: [], opacity: 1 });

/** Somma gli effetti attivi di un livello al tempo t (locale al livello). */
export function runEffects(list: EffectInstance[], c: FxCtx): FxOut {
  const out = emptyOut();
  for (const fx of list) {
    const def = getEffect(fx.defId);
    if (!fx.enabled || !def?.render) continue;
    const vals: Record<string, number[]> = {};
    const idx = list.indexOf(fx);
    for (const p of def.params)
      vals[p.id] = fx.params[p.id]
        ? valueAt(fx.params[p.id], c.t, c.host ? { host: { project: c.host.project, comp: c.host.comp, layerId: c.host.layerId, path: `e.${c.host.effectIndex ?? idx}.${p.id}` } } : undefined)
        : typeof p.default === "function"
          ? p.default(c.w, c.h)
          : p.default;
    def.render(vals, { ...c, id: `${c.id}-${fx.id}` }, out);
  }
  return out;
}

export function audioGainDb(list: EffectInstance[], t: number) {
  let g = 0;
  for (const fx of list) {
    if (!fx.enabled) continue;
    if (fx.defId === "a-gain") g += valueAt(fx.params.gain, t)[0];
    if (fx.defId === "a-amplify") g += (valueAt(fx.params.left, t)[0] + valueAt(fx.params.right, t)[0]) / 2;
  }
  return g;
}

// ---- transizioni ---------------------------------------------------------------------

export type TransitionCategory = "Dissolvenza" | "Diapositiva" | "Iris" | "Tendina" | "Zoom" | "Pagina" | "Movimento 3D" | "Dissolvenza incrociata (audio)";

export interface TransitionDef {
  id: string;
  name: string;
  category: TransitionCategory;
  audio?: boolean;
  /** p = avanzamento 0→1. a = clip in uscita, b = clip in entrata */
  render?: (p: number) => { a?: CSSProperties; b?: CSSProperties; over?: CSSProperties; wrap?: CSSProperties; bOnTop?: boolean };
}

const pctStr = (x: number) => `${(x * 100).toFixed(3)}%`;

export const TRANSITIONS: TransitionDef[] = [
  { id: "cross", name: "Dissolvenza incrociata", category: "Dissolvenza", render: (p) => ({ b: { opacity: p } }) },
  { id: "additive", name: "Dissolvenza additiva", category: "Dissolvenza", render: (p) => ({ a: { opacity: Math.min(1, 2 - 2 * p) }, b: { opacity: Math.min(1, 2 * p), mixBlendMode: "plus-lighter" } }) },
  { id: "film", name: "Dissolvenza film", category: "Dissolvenza", render: (p) => ({ b: { opacity: Math.pow(p, 2.2) / (Math.pow(p, 2.2) + Math.pow(1 - p, 2.2)) } }) },
  { id: "dipBlack", name: "Tuffo nel nero", category: "Dissolvenza", render: (p) => ({ a: { opacity: p < 0.5 ? 1 : 0 }, b: { opacity: p < 0.5 ? 0 : 1 }, over: { background: "#000", opacity: 1 - Math.abs(1 - 2 * p) } }) },
  { id: "dipWhite", name: "Tuffo nel bianco", category: "Dissolvenza", render: (p) => ({ a: { opacity: p < 0.5 ? 1 : 0 }, b: { opacity: p < 0.5 ? 0 : 1 }, over: { background: "#fff", opacity: 1 - Math.abs(1 - 2 * p) } }) },
  { id: "nonAdditive", name: "Dissolvenza non additiva", category: "Dissolvenza", render: (p) => ({ a: { opacity: 1 - p }, b: { opacity: p, mixBlendMode: "lighten" } }) },
  { id: "morph", name: "Morph", category: "Dissolvenza", render: (p) => ({ a: { opacity: 1 - p, filter: `blur(${Math.sin(p * Math.PI) * 6}px)` }, b: { opacity: p, filter: `blur(${Math.sin(p * Math.PI) * 6}px)` } }) },
  { id: "push", name: "Spingi", category: "Diapositiva", render: (p) => ({ a: { transform: `translateX(${-p * 100}%)` }, b: { transform: `translateX(${(1 - p) * 100}%)` } }) },
  { id: "slide", name: "Diapositiva", category: "Diapositiva", render: (p) => ({ b: { transform: `translateX(${(1 - p) * 100}%)` } }) },
  { id: "split", name: "Dividi", category: "Diapositiva", render: (p) => ({ bOnTop: false, a: { clipPath: `polygon(0 0, ${pctStr(0.5 - p / 2)} 0, ${pctStr(0.5 - p / 2)} 100%, 0 100%, 0 0, 100% 0, 100% 100%, ${pctStr(0.5 + p / 2)} 100%, ${pctStr(0.5 + p / 2)} 0, 100% 0)` } }) },
  { id: "center", name: "Dividi al centro", category: "Diapositiva", render: (p) => ({ b: { clipPath: `inset(${pctStr((1 - p) / 2)})` } }) },
  { id: "bandSlide", name: "Diapositiva a bande", category: "Diapositiva", render: (p) => ({ b: { maskImage: `repeating-linear-gradient(0deg, black 0 ${p * 60}px, transparent ${p * 60}px 60px)` } }) },
  { id: "wipe", name: "Tendina", category: "Tendina", render: (p) => ({ b: { clipPath: `inset(0 ${pctStr(1 - p)} 0 0)` } }) },
  { id: "clockWipe", name: "Tendina a orologio", category: "Tendina", render: (p) => ({ b: { maskImage: `conic-gradient(black ${p * 360}deg, transparent ${p * 360}deg)` } }) },
  { id: "venetian", name: "Tendine veneziane", category: "Tendina", render: (p) => ({ b: { maskImage: `repeating-linear-gradient(90deg, black 0 ${p * 80}px, transparent ${p * 80}px 80px)` } }) },
  { id: "checker", name: "Tendina a scacchiera", category: "Tendina", render: (p) => ({ b: { maskImage: `conic-gradient(black 25%, transparent 0 50%, black 0 75%, transparent 0)`, maskSize: "160px 160px", opacity: Math.min(1, 2 * p) } }) },
  { id: "gradientWipe", name: "Tendina sfumata", category: "Tendina", render: (p) => ({ b: { maskImage: `linear-gradient(90deg, black ${p * 140 - 40}%, transparent ${p * 140}%)` } }) },
  { id: "irisRound", name: "Iris rotondo", category: "Iris", render: (p) => ({ b: { clipPath: `circle(${pctStr(p * 0.75)} at 50% 50%)` } }) },
  { id: "irisBox", name: "Iris a scatola", category: "Iris", render: (p) => ({ b: { clipPath: `inset(${pctStr((1 - p) / 2)})` } }) },
  { id: "irisCross", name: "Iris a croce", category: "Iris", render: (p) => { const s = p * 50; const q = (x: number) => `${x}%`; return { b: { clipPath: `polygon(${q(50 - s / 3)} 0, ${q(50 + s / 3)} 0, ${q(50 + s / 3)} ${q(50 - s)}, ${q(50 + s)} ${q(50 - s)}, ${q(50 + s)} ${q(50 - s / 3)}, 100% ${q(50 - s / 3)}, 100% ${q(50 + s / 3)}, ${q(50 + s)} ${q(50 + s / 3)}, ${q(50 + s)} ${q(50 + s)}, ${q(50 + s / 3)} ${q(50 + s)}, ${q(50 + s / 3)} 100%, ${q(50 - s / 3)} 100%, ${q(50 - s / 3)} ${q(50 + s)}, ${q(50 - s)} ${q(50 + s)}, ${q(50 - s)} ${q(50 + s / 3)}, 0 ${q(50 + s / 3)}, 0 ${q(50 - s / 3)}, ${q(50 - s)} ${q(50 - s / 3)}, ${q(50 - s)} ${q(50 - s)}, ${q(50 - s / 3)} ${q(50 - s)})` } }; } },
  { id: "irisDiamond", name: "Iris a rombo", category: "Iris", render: (p) => { const s = p * 100; return { b: { clipPath: `polygon(50% ${50 - s}%, ${50 + s}% 50%, 50% ${50 + s}%, ${50 - s}% 50%)` } }; } },
  { id: "crossZoom", name: "Zoom incrociato", category: "Zoom", render: (p) => (p < 0.5 ? { a: { transform: `scale(${1 + p * 8})`, filter: `blur(${p * 16}px) brightness(${1 + p})` }, b: { opacity: 0 } } : { a: { opacity: 0 }, b: { transform: `scale(${1 + (1 - p) * 8})`, filter: `blur(${(1 - p) * 16}px) brightness(${2 - p})` } }) },
  { id: "zoomIn", name: "Zoom", category: "Zoom", render: (p) => ({ b: { transform: `scale(${Math.max(0.001, p)})` } }) },
  { id: "pagePeel", name: "Voltapagina", category: "Pagina", render: (p) => ({ bOnTop: false, a: { clipPath: `polygon(0 0, ${pctStr(2 * (1 - p))} 0, 0 ${pctStr(2 * (1 - p))})`, filter: "drop-shadow(10px 10px 14px rgba(0,0,0,.6))" } }) },
  { id: "pageTurn", name: "Arrotola pagina", category: "Pagina", render: (p) => ({ bOnTop: false, a: { transformOrigin: "0 50%", transform: `perspective(1600px) rotateY(${-p * 90}deg)` } }) },
  { id: "cube", name: "Cubo che ruota", category: "Movimento 3D", render: (p) => ({ wrap: { perspective: "1600px" }, a: { transformOrigin: "100% 50%", transform: `translateX(${-p * 100}%) rotateY(${-p * 90}deg)` }, b: { transformOrigin: "0 50%", transform: `translateX(${(1 - p) * 100}%) rotateY(${(1 - p) * 90}deg)` } }) },
  { id: "flip", name: "Capovolgi su sé stesso", category: "Movimento 3D", render: (p) => ({ wrap: { perspective: "1600px" }, a: { transform: `rotateY(${p * 180}deg)`, backfaceVisibility: "hidden", opacity: p < 0.5 ? 1 : 0 }, b: { transform: `rotateY(${(p - 1) * 180}deg)`, backfaceVisibility: "hidden", opacity: p < 0.5 ? 0 : 1 } }) },
  { id: "aPower", name: "Potenza costante", category: "Dissolvenza incrociata (audio)", audio: true },
  { id: "aGain", name: "Guadagno costante", category: "Dissolvenza incrociata (audio)", audio: true },
  { id: "aExp", name: "Dissolvenza esponenziale", category: "Dissolvenza incrociata (audio)", audio: true },
];

export const getTransition = (id: string) => TRANSITIONS.find((t) => t.id === id);

export const EFFECT_CATEGORIES: Category[] = [
  "Controlli per espressioni","Canale", "Correzione colore", "Distorsione", "Disturbo e granulosità", "Genera", "Keying", "Prospettiva", "Regolazione", "Sfocatura e nitidezza", "Stilizza", "Tempo", "Trasforma", "Transizione", "Utilità", "Video"];
export const TRANSITION_CATEGORIES: TransitionCategory[] = ["Dissolvenza", "Diapositiva", "Iris", "Movimento 3D", "Pagina", "Tendina", "Zoom"];

export const BLEND_MODES: [string, CSSProperties["mixBlendMode"]][] = [
  ["Normale", "normal"],
  ["Dissolvi", "normal"],
  ["Scurisci", "darken"],
  ["Moltiplica", "multiply"],
  ["Brucia colore", "color-burn"],
  ["Schiarisci", "lighten"],
  ["Scolora", "color-dodge"],
  ["Schermo", "screen"],
  ["Aggiungi", "plus-lighter"],
  ["Sovrapponi", "overlay"],
  ["Luce soffusa", "soft-light"],
  ["Luce intensa", "hard-light"],
  ["Differenza", "difference"],
  ["Esclusione", "exclusion"],
  ["Tonalità", "hue"],
  ["Saturazione", "saturation"],
  ["Colore", "color"],
  ["Luminosità", "luminosity"],
];
