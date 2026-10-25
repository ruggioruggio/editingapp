"use client";

import { useReducer, useRef } from "react";
import clsx from "clsx";
import { makeLayer, setProp, useAfterEffects, valueAt, type AeComp, type AeLayer } from "@/lib/studio/afterEffects";

function star(r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${i ? "L" : "M"}${Math.cos(a) * rr} ${Math.sin(a) * rr}`;
  }).join(" ") + "Z";
}

export function LayerShape({ l, comp }: { l: AeLayer; comp: AeComp }) {
  if (l.type === "solid") return <rect width={comp.width} height={comp.height} fill={l.color} />;
  if (l.type === "text") {
    return (
      <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fontSize={l.fontSize} fontWeight={900} fill={l.color} style={{ fontFamily: "inherit" }}>
        {l.text}
      </text>
    );
  }
  const [w, h] = l.size ?? [200, 200];
  if (l.shape === "ellipse") return <ellipse rx={w / 2} ry={h / 2} fill={l.color} />;
  if (l.shape === "star") return <path d={star(Math.min(w, h) / 2)} fill={l.color} />;
  return <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={Math.min(w, h) * 0.08} fill={l.color} />;
}

export const transformAt = (l: AeLayer, t: number) => {
  const [ax, ay] = valueAt(l.props.anchor, t);
  const [px, py] = valueAt(l.props.position, t);
  const [sx, sy] = valueAt(l.props.scale, t);
  const [r] = valueAt(l.props.rotation, t);
  const [o] = valueAt(l.props.opacity, t);
  return { transform: `translate(${px} ${py}) rotate(${r}) scale(${sx / 100} ${sy / 100}) translate(${-ax} ${-ay})`, opacity: Math.max(0, Math.min(1, o / 100)), px, py };
};

export function CompRender({ comp, t, interactive }: { comp: AeComp; t: number; interactive?: (l: AeLayer) => React.SVGProps<SVGGElement> }) {
  return (
    <>
      {[...comp.layers].reverse().map((l) => {
        if (!l.visible || t < l.inPoint || t >= l.outPoint) return null;
        const { transform, opacity } = transformAt(l, t);
        return (
          <g key={l.id} transform={transform} opacity={opacity} {...interactive?.(l)}>
            <LayerShape l={l} comp={comp} />
          </g>
        );
      })}
    </>
  );
}

export function CompView() {
  const st = useAfterEffects();
  const { comp, time, selected, tool } = st;
  const svg = useRef<SVGSVGElement>(null);
  const draft = useRef<{ x0: number; y0: number; x: number; y: number } | null>(null);
  const [, redraw] = useReducer((x: number) => x + 1, 0);

  const toComp = (e: { clientX: number; clientY: number }) => {
    const r = svg.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * comp.width, ((e.clientY - r.top) / r.height) * comp.height] as [number, number];
  };

  const startMove = (e: React.PointerEvent, l: AeLayer) => {
    if (tool !== "select") return;
    e.stopPropagation();
    if (!selected.includes(l.id) || e.shiftKey) st.set({ selected: e.shiftKey ? [...new Set([...selected, l.id])] : [l.id] });
    const p0 = toComp(e);
    const ids = selected.includes(l.id) && !e.shiftKey ? selected : [l.id];
    const starts = ids.map((id) => [id, valueAt(comp.layers.find((x) => x.id === id)!.props.position, time)] as const);
    const el = e.currentTarget as Element;
    el.setPointerCapture(e.pointerId);
    st.beginGesture();
    const move = (ev: PointerEvent) => {
      const p = toComp(ev);
      st.updateGesture((base) => starts.reduce((c, [id, s]) => setProp(c, id, "position", [Math.round(s[0] + p[0] - p0[0]), Math.round(s[1] + p[1] - p0[1])], time), base));
    };
    const up = () => {
      el.removeEventListener("pointermove", move as EventListener);
      el.removeEventListener("pointerup", up);
      st.endGesture();
    };
    el.addEventListener("pointermove", move as EventListener);
    el.addEventListener("pointerup", up);
  };

  const onBackground = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toComp(e);
    if (tool === "select" || tool === "hand") return st.set({ selected: [], selectedKeys: [] });
    if (tool === "text") {
      const l = makeLayer("text", comp, comp.layers.length, [Math.round(p[0]), Math.round(p[1])], { name: "Testo", text: "Testo" });
      l.inPoint = 0;
      st.commit({ ...comp, layers: [l, ...comp.layers] });
      st.set({ selected: [l.id], tool: "select" });
      st.notify("Livello di testo creato: modifica il testo nel pannello Carattere");
      return;
    }
    // rettangolo / ellisse: si disegna trascinando
    draft.current = { x0: p[0], y0: p[1], x: p[0], y: p[1] };
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    redraw();
    const move = (ev: PointerEvent) => {
      const q = toComp(ev);
      if (draft.current) draft.current = { ...draft.current, x: q[0], y: q[1] };
      redraw();
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      const d = draft.current;
      draft.current = null;
      redraw();
      if (!d) return;
      const w = Math.max(40, Math.abs(d.x - d.x0));
      const h = Math.max(40, Math.abs(d.y - d.y0));
      const s = useAfterEffects.getState();
      const l = makeLayer("shape", s.comp, s.comp.layers.length, [Math.round((d.x + d.x0) / 2), Math.round((d.y + d.y0) / 2)], {
        shape: s.tool === "ellipse" ? "ellipse" : "rect",
        size: [Math.round(w), Math.round(h)],
        color: ["#ffc93c", "#2d8ceb", "#ff5f5f", "#3ecf8e", "#d291ff"][s.comp.layers.length % 5],
      });
      s.commit({ ...s.comp, layers: [l, ...s.comp.layers] });
      s.set({ selected: [l.id] });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  const sel = comp.layers.filter((l) => selected.includes(l.id));
  const d = draft.current;

  return (
    <div className="grid h-full place-items-center overflow-hidden bg-[#1a1a1a] p-3">
      <svg
        ref={svg}
        viewBox={`0 0 ${comp.width} ${comp.height}`}
        className={clsx("max-h-full max-w-full touch-none bg-black shadow-[0_0_0_1px_#000]", tool === "text" && "cursor-text", (tool === "rect" || tool === "ellipse") && "cursor-crosshair")}
        style={{ aspectRatio: `${comp.width} / ${comp.height}`, width: "100%", height: "auto" }}
        onPointerDown={onBackground}
      >
        <rect width={comp.width} height={comp.height} fill={comp.bg} />
        <CompRender comp={comp} t={time} interactive={(l) => ({ onPointerDown: (e) => startMove(e, l), style: { cursor: tool === "select" ? "move" : undefined } })} />
        {sel.map((l) => {
          if (time < l.inPoint || time >= l.outPoint) return null;
          const path = l.props.position.keys;
          const { px, py } = transformAt(l, time);
          const pts: string[] = [];
          if (path && path.length > 1) {
            const t0 = path[0].t;
            const t1 = path[path.length - 1].t;
            for (let t = t0; t <= t1 + 1e-6; t += 1 / comp.fps) {
              const [x, y] = valueAt(l.props.position, t);
              pts.push(`${x},${y}`);
            }
          }
          const k = Math.max(2, comp.width / 500);
          return (
            <g key={l.id} pointerEvents="none">
              {pts.length > 1 && (
                <>
                  <polyline points={pts.join(" ")} fill="none" stroke="#e8d64a" strokeWidth={k} strokeDasharray={`${k * 2} ${k * 2}`} />
                  {pts.map((p, i) => (
                    <circle key={i} cx={p.split(",")[0]} cy={p.split(",")[1]} r={k * 0.9} fill="#e8d64a" opacity={0.6} />
                  ))}
                  {path!.map((kf) => (
                    <rect key={kf.id} x={kf.v[0] - k * 4} y={kf.v[1] - k * 4} width={k * 8} height={k * 8} fill="none" stroke="#e8d64a" strokeWidth={k} />
                  ))}
                </>
              )}
              <circle cx={px} cy={py} r={k * 6} fill="none" stroke="#fff" strokeWidth={k} />
              <path d={`M${px - k * 12} ${py}h${k * 24}M${px} ${py - k * 12}v${k * 24}`} stroke="#fff" strokeWidth={k} />
            </g>
          );
        })}
        {d && (
          <rect
            x={Math.min(d.x, d.x0)}
            y={Math.min(d.y, d.y0)}
            width={Math.abs(d.x - d.x0)}
            height={Math.abs(d.y - d.y0)}
            rx={tool === "ellipse" ? 9999 : 0}
            fill="rgb(45 140 235 / .25)"
            stroke="#2d8ceb"
            strokeWidth={4}
          />
        )}
      </svg>
    </div>
  );
}
