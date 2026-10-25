"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { fileUrl, type Media } from "@/lib/studio/media";
import type { FxOut } from "@/lib/studio/effects";
import { MediaVisual } from "./MediaVisual";

// Pezzi di disegno comuni: il contenuto di un file a un certo istante (anche i
// video veri, tenuti sincronizzati con l'indicatore), gli effetti applicati a
// un livello e il "palco" che scala la sequenza dentro al monitor.

export function SyncedVideo({ src, t, playing, rate = 1 }: { src: string; t: number; playing: boolean; rate?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.playbackRate = Math.max(0.1, Math.min(16, Math.abs(rate)));
    if (playing && rate > 0) {
      if (Math.abs(v.currentTime - t) > 0.3) v.currentTime = t;
      if (v.paused) void v.play().catch(() => {});
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - t) > 0.02) v.currentTime = t;
    }
  }, [t, playing, rate]);
  return <video ref={ref} src={src} muted playsInline preload="auto" className="h-full w-full object-fill" />;
}

/** Audio di un file importato: suona solo durante la riproduzione. */
export function SyncedAudio({ src, t, playing, volume, rate = 1 }: { src: string; t: number; playing: boolean; volume: number; rate?: number }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = Math.max(0, Math.min(1, volume));
    a.playbackRate = Math.max(0.1, Math.min(16, Math.abs(rate)));
    if (playing && rate > 0) {
      if (Math.abs(a.currentTime - t) > 0.3) a.currentTime = t;
      if (a.paused) void a.play().catch(() => {});
    } else if (!a.paused) a.pause();
  }, [t, playing, volume, rate]);
  return <audio ref={ref} src={src} preload="auto" className="hidden" />;
}

function Bars() {
  const top = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-[67%]">
        {top.map((c) => (
          <div key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <div className="flex h-[8%]">
        {["#0000c0", "#131313", "#c000c0", "#131313", "#00c0c0", "#131313", "#c0c0c0"].map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <div className="flex flex-1">
        {["#00214c", "#ffffff", "#32006a", "#131313", "#090909", "#131313", "#1d1d1d", "#131313"].map((c, i) => (
          <div key={i} className={i < 4 ? "flex-[1.25]" : "flex-1"} style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function Countdown({ t, color }: { t: number; color?: string }) {
  const n = Math.max(2, 8 - Math.floor(t));
  const sweep = (t % 1) * 360;
  return (
    <svg viewBox="0 0 160 90" className="h-full w-full">
      <rect width="160" height="90" fill={color ?? "#bdbdbd"} />
      <path d={`M80 45 L80 -60 A105 105 0 ${sweep > 180 ? 1 : 0} 1 ${80 + Math.sin((sweep * Math.PI) / 180) * 105} ${45 - Math.cos((sweep * Math.PI) / 180) * 105} Z`} fill="#8a8a8a" />
      <line x1="0" y1="45" x2="160" y2="45" stroke="#222" strokeWidth=".6" />
      <line x1="80" y1="0" x2="80" y2="90" stroke="#222" strokeWidth=".6" />
      <circle cx="80" cy="45" r="30" fill="none" stroke="#fff" strokeWidth="1.2" />
      <circle cx="80" cy="45" r="36" fill="none" stroke="#fff" strokeWidth="1.2" />
      <text x="80" y="58" textAnchor="middle" fontSize="38" fontWeight="700" fill="#111">
        {t < 8 ? n : ""}
      </text>
    </svg>
  );
}

export function Offline({ name }: { name: string }) {
  return (
    <div className="grid h-full w-full place-items-center bg-[#c42323] text-center text-white">
      <div style={{ fontSize: "4cqw" }} className="font-bold">
        Media offline
        <div style={{ fontSize: "1.6cqw" }} className="font-normal opacity-80">
          {name}
        </div>
      </div>
    </div>
  );
}

/** Contenuto visivo di un file al tempo t (in secondi del file). */
export function MediaContent({ media, t, playing = false, rate = 1 }: { media: Media; t: number; playing?: boolean; rate?: number }) {
  if (media.file) {
    const url = fileUrl(media.id);
    if (!url) return <Offline name={media.name} />;
    if (media.kind === "image") return <img src={url} alt="" draggable={false} className="h-full w-full select-none object-fill" />;
    if (media.kind === "video") return <SyncedVideo src={url} t={t} playing={playing} rate={rate} />;
    return null;
  }
  switch (media.kind) {
    case "black":
      return <div className="h-full w-full bg-black" />;
    case "matte":
      return <div className="h-full w-full" style={{ background: media.color }} />;
    case "bars":
      return <Bars />;
    case "countdown":
      return <Countdown t={t} color={media.color} />;
    case "adjustment":
    case "graphic":
    case "audio":
      return null;
    default:
      return media.subject ? <MediaVisual subject={media.subject} hue={media.hue ?? 200} t={t} text={media.text} /> : null;
  }
}

/** Miniatura per i pannelli progetto (con scacchiera dietro la grafica trasparente). */
export function Thumb({ media, t = 1 }: { media: Media; t?: number }) {
  if (media.kind === "adjustment") return <div className="grid h-full w-full place-items-center bg-[#3d3d52] text-[9px] text-white/70">Regolazione</div>;
  if (media.kind === "audio" && !media.subject) return <div className="h-full w-full bg-[#12261b]" />;
  if (media.file && media.kind === "video") {
    const url = fileUrl(media.id);
    return url ? <video src={`${url}#t=${t}`} muted preload="metadata" className="h-full w-full object-cover" /> : <Offline name={media.name} />;
  }
  if (media.subject && !media.file) return <MediaVisual subject={media.subject} hue={media.hue ?? 200} t={t} text={media.text} thumb />;
  return <MediaContent media={media} t={t} />;
}

/** Applica il risultato degli effetti a un livello. `render(t)` disegna il contenuto (serve per Eco). */
export function FxWrap({ out, w, h, t, render, style }: { out: FxOut; w: number; h: number; t: number; render: (t: number) => ReactNode; style?: CSSProperties }) {
  const lt = out.time ? out.time(t) : t;
  const mask = out.mask.length ? out.mask.join(", ") : undefined;
  const content = (time: number) => (
    <>
      {render(time)}
      {out.overlays}
    </>
  );
  let body: ReactNode = content(lt);
  if (out.mirror !== undefined) {
    const horizontal = out.mirror < 2;
    const first = out.mirror % 2 === 0;
    const half = horizontal ? (first ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)") : first ? "inset(0 0 50% 0)" : "inset(50% 0 0 0)";
    body = (
      <>
        <div className="absolute inset-0" style={{ clipPath: half }}>
          {content(lt)}
        </div>
        <div className="absolute inset-0" style={{ clipPath: half, transform: horizontal ? "scaleX(-1)" : "scaleY(-1)" }}>
          {content(lt)}
        </div>
      </>
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{
        ...style,
        opacity: (style?.opacity === undefined ? 1 : Number(style.opacity)) * out.opacity,
        filter: out.filter.length ? out.filter.join(" ") : undefined,
        clipPath: out.clip,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskComposite: out.mask.length > 1 ? "intersect" : undefined,
        WebkitMaskComposite: out.mask.length > 1 ? "source-in" : undefined,
        perspective: out.perspective,
      }}
    >
      {out.svg.length > 0 && (
        <svg width="0" height="0" className="absolute">
          <defs>{out.svg}</defs>
        </svg>
      )}
      {out.echo &&
        Array.from({ length: out.echo.count }, (_, i) => (
          <div key={i} className="absolute inset-0" style={{ opacity: Math.pow(out.echo!.decay, i + 1) }}>
            {render(Math.max(0, lt + out.echo!.delay * (i + 1)))}
          </div>
        )).reverse()}
      <div className="absolute inset-0" style={{ transform: out.transform.length ? out.transform.join(" ") : undefined, transformStyle: out.perspective ? "preserve-3d" : undefined }}>
        {body}
      </div>
      {/* dimensioni per i filtri SVG */}
      <span className="hidden" data-w={w} data-h={h} />
    </div>
  );
}

/**
 * Palco: un riquadro grande quanto la sequenza (in pixel veri) scalato per
 * stare nel monitor. `zoom` = "fit" oppure percentuale.
 */
export function Stage({
  w,
  h,
  zoom = "fit",
  children,
  bg = "#000",
  onPointerDown,
  overlay,
  className,
}: {
  w: number;
  h: number;
  zoom?: "fit" | number;
  children: ReactNode;
  bg?: string;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>, toLocal: (x: number, y: number) => [number, number], scale: number) => void;
  overlay?: (scale: number) => ReactNode;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);
  const fit = Math.min((size.w - 16) / w, (size.h - 16) / h);
  const scale = Math.max(0.01, zoom === "fit" ? fit : zoom / 100);
  const toLocal = (x: number, y: number): [number, number] => {
    const r = inner.current!.getBoundingClientRect();
    return [((x - r.left) / r.width) * w, ((y - r.top) / r.height) * h];
  };
  return (
    <div ref={box} className={"relative h-full w-full overflow-hidden " + (className ?? "")}>
      {size.w > 0 && (
        <div className="absolute left-1/2 top-1/2" style={{ width: w * scale, height: h * scale, transform: "translate(-50%,-50%)" }}>
          <div
            ref={inner}
            className="absolute left-0 top-0 origin-top-left overflow-hidden"
            style={{ width: w, height: h, transform: `scale(${scale})`, background: bg, containerType: "inline-size" }}
            onPointerDown={onPointerDown ? (e) => onPointerDown(e, toLocal, scale) : undefined}
          >
            {children}
          </div>
          {overlay && <div className="pointer-events-none absolute inset-0">{overlay(scale)}</div>}
        </div>
      )}
    </div>
  );
}

/** Geometria di un livello: ancoraggio, posizione, scala, rotazione (anche 3D). */
export function boxTransform(o: { anchor: number[]; position: number[]; scale: number[]; rotation: number; rotX?: number; rotY?: number; z?: number }) {
  const [ax, ay] = o.anchor;
  const [px, py] = o.position;
  const z = o.z ?? 0;
  return {
    transformOrigin: `${ax}px ${ay}px`,
    transform: `translate3d(${px - ax}px, ${py - ay}px, ${-z}px)${o.rotX ? ` rotateX(${o.rotX}deg)` : ""}${o.rotY ? ` rotateY(${o.rotY}deg)` : ""} rotate(${o.rotation}deg) scale(${o.scale[0] / 100}, ${(o.scale[1] ?? o.scale[0]) / 100})`,
  } satisfies CSSProperties;
}
