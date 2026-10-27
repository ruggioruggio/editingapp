"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { create } from "zustand";
import { Menu as MenuIcon, X } from "lucide-react";
import { ContextMenu } from "./chrome";
import type { MenuItemLike } from "@/lib/studio/premiere";

// Pannelli agganciabili come nei programmi Adobe: ogni zona ha le sue schede.
// Una scheda si sposta trascinandola su un'altra zona (col mouse subito, col
// dito dopo averla tenuta premuta un attimo). Col tasto destro (o tenendo
// premuto senza muoversi) si chiude; si riapre dal menu Finestra.
// La disposizione resta salvata nel dispositivo.

export type Zones = Record<string, { tabs: string[]; active: string }>;
interface Saved {
  zones: Zones;
  closed: string[];
}

export function useDockLayout(storageKey: string, defaults: Zones, available: string[]) {
  const sanitize = useCallback(
    (z: Zones, closed: string[]): Saved => {
      const out: Zones = {};
      const seen = new Set<string>();
      const shut = closed.filter((t) => available.includes(t));
      for (const id of Object.keys(defaults)) {
        const tabs = (z[id]?.tabs ?? []).filter((t) => available.includes(t) && !seen.has(t) && !shut.includes(t));
        tabs.forEach((t) => seen.add(t));
        out[id] = { tabs, active: tabs.includes(z[id]?.active) ? z[id].active : tabs[0] ?? "" };
      }
      // pannelli nuovi o persi (e non chiusi apposta) tornano nella loro zona
      for (const [id, d] of Object.entries(defaults))
        for (const t of d.tabs)
          if (!seen.has(t) && !shut.includes(t) && available.includes(t)) {
            out[id].tabs.push(t);
            seen.add(t);
            if (!out[id].active) out[id].active = t;
          }
      return { zones: out, closed: shut };
    },
    [defaults, available],
  );
  const [state, setState] = useState<Saved>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        return sanitize(s.zones ?? {}, s.closed ?? []);
      }
    } catch {
      /* layout predefinito */
    }
    return sanitize(defaults, []);
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* niente */
    }
  }, [state, storageKey]);

  const zones = state.zones;
  const setZones = (fn: (z: Zones) => Zones) => setState((s) => ({ ...s, zones: fn(s.zones) }));
  const homeOf = (tab: string) => Object.keys(defaults).find((k) => defaults[k].tabs.includes(tab)) ?? Object.keys(defaults)[0];

  const move = useCallback((tab: string, to: string, index?: number) => {
    setState((s) => {
      const z = s.zones;
      const from = Object.keys(z).find((k) => z[k].tabs.includes(tab));
      if (!from || !z[to]) return s;
      const next: Zones = Object.fromEntries(Object.entries(z).map(([k, v]) => [k, { ...v, tabs: v.tabs.filter((t) => t !== tab) }]));
      const tabs = [...next[to].tabs];
      tabs.splice(index ?? tabs.length, 0, tab);
      next[to] = { tabs, active: tab };
      if (from !== to && next[from].active === tab) next[from].active = next[from].tabs[0] ?? "";
      return { ...s, zones: next };
    });
  }, []);
  const activate = useCallback((zone: string, tab: string) => setState((s) => ({ ...s, zones: { ...s.zones, [zone]: { ...s.zones[zone], active: tab } } })), []);
  /** porta in primo piano la scheda (riaprendola se era chiusa) */
  const show = useCallback(
    (tab: string) =>
      setState((s) => {
        const k = Object.keys(s.zones).find((id) => s.zones[id].tabs.includes(tab));
        if (k) return { ...s, zones: { ...s.zones, [k]: { ...s.zones[k], active: tab } } };
        if (!available.includes(tab)) return s;
        const home = homeOf(tab);
        return { closed: s.closed.filter((t) => t !== tab), zones: { ...s.zones, [home]: { tabs: [...s.zones[home].tabs, tab], active: tab } } };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [available, defaults],
  );
  const close = useCallback((tab: string) => {
    setState((s) => {
      const zones2: Zones = Object.fromEntries(
        Object.entries(s.zones).map(([k, v]) => {
          const tabs = v.tabs.filter((t) => t !== tab);
          return [k, { tabs, active: v.active === tab ? tabs[0] ?? "" : v.active }];
        }),
      );
      return { zones: zones2, closed: [...new Set([...s.closed, tab])] };
    });
  }, []);
  const isOpen = (tab: string) => Object.values(zones).some((z) => z.tabs.includes(tab));
  const toggle = (tab: string) => (isOpen(tab) ? close(tab) : show(tab));
  const reset = useCallback(() => setState(sanitize(defaults, [])), [defaults, sanitize]);
  void setZones;
  return { zones, move, activate, show, close, isOpen, toggle, reset, available };
}

const useDrag = create<{ tab: string | null; label: string; x: number; y: number; over: string | null }>(() => ({ tab: null, label: "", x: 0, y: 0, over: null }));

export function DragGhost() {
  const d = useDrag();
  if (!d.tab) return null;
  return (
    <div className="pointer-events-none fixed z-[95] rounded-md border border-[#2d8ceb] bg-[#2b2b2b]/95 px-3 py-1 text-[12px] text-white shadow-xl" style={{ left: d.x + 12, top: d.y + 8 }}>
      {d.label}
    </div>
  );
}

/** Voci del menu Finestra: un segno di spunta per ogni pannello aperto. */
export function windowMenu(layout: ReturnType<typeof useDockLayout>, labels: Record<string, string>): MenuItemLike[] {
  return [
    ...layout.available.map((t) => ({ label: labels[t] ?? t, checked: layout.isOpen(t), action: () => layout.toggle(t) })),
    "-",
    { label: "Ripristina disposizione pannelli", action: layout.reset },
  ];
}

export function DockZone({
  id,
  layout,
  labels,
  render,
  zoneNames,
  focused,
  onFocus,
  className,
  style,
  menu,
}: {
  id: string;
  layout: ReturnType<typeof useDockLayout>;
  labels: Record<string, string>;
  render: (tab: string) => ReactNode;
  zoneNames: Record<string, string>;
  focused?: boolean;
  onFocus?: (tab: string) => void;
  className?: string;
  style?: React.CSSProperties;
  menu?: (tab: string) => MenuItemLike[];
}) {
  const zone = layout.zones[id];
  const over = useDrag((s) => s.over === id);
  const [m, setM] = useState<{ x: number; y: number; tab: string; panel?: boolean } | null>(null);
  if (!zone) return null;

  const tabMenu = (tab: string): MenuItemLike[] => [
    { label: "Chiudi pannello", action: () => layout.close(tab) },
    {
      label: "Sposta pannello in",
      sub: Object.keys(layout.zones)
        .filter((z) => z !== id)
        .map((z) => ({ label: zoneNames[z] ?? z, action: () => layout.move(tab, z) })),
    },
    "-",
    { label: "Ripristina disposizione pannelli", action: layout.reset },
  ];

  const startDrag = (e: React.PointerEvent, tab: string) => {
    if (e.button !== 0) return;
    const el = e.currentTarget as HTMLElement;
    const x0 = e.clientX;
    const y0 = e.clientY;
    const touch = e.pointerType !== "mouse";
    let armed = !touch;
    let dragging = false;
    const block = (ev: TouchEvent) => ev.preventDefault();
    // col dito: tenendo premuto la scheda "si stacca" e si può trascinare
    const timer = touch
      ? setTimeout(() => {
          armed = true;
          document.addEventListener("touchmove", block, { passive: false });
          try {
            el.setPointerCapture(e.pointerId);
          } catch {
            /* niente */
          }
          navigator.vibrate?.(15);
          useDrag.setState({ tab, label: labels[tab] ?? tab, x: x0, y: y0, over: id });
        }, 380)
      : undefined;
    const move = (ev: PointerEvent) => {
      if (!armed) {
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) clearTimeout(timer);
        return;
      }
      if (!dragging && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return;
      dragging = true;
      const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>("[data-dock-zone]");
      useDrag.setState({ tab, label: labels[tab] ?? tab, x: ev.clientX, y: ev.clientY, over: target?.dataset.dockZone ?? null });
    };
    const up = () => {
      clearTimeout(timer);
      document.removeEventListener("touchmove", block);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const target = useDrag.getState().over;
      useDrag.setState({ tab: null, over: null });
      if (dragging && target) layout.move(tab, target);
      // tenuta premuta senza spostarsi: menu con Chiudi / Sposta
      else if (touch && armed) setM({ x: x0, y: y0, tab });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const active = zone.active;
  return (
    <section
      data-dock-zone={id}
      onPointerDownCapture={() => active && onFocus?.(active)}
      style={style}
      className={clsx("relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[4px] border bg-[#1e1e1e]", over ? "border-[#2d8ceb] ring-2 ring-[#2d8ceb]/40" : focused ? "border-[#2d8ceb]" : "border-[#1e1e1e]", className)}
    >
      <div className="flex h-[34px] shrink-0 items-center gap-4 overflow-x-auto px-3 text-[12.5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {zone.tabs.map((t) => (
          <div key={t} className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onPointerDown={(e) => startDrag(e, t)}
              onClick={() => layout.activate(id, t)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === "touch") return;
                setM({ x: e.clientX, y: e.clientY, tab: t });
              }}
              title="Trascina per spostare · tasto destro per chiudere"
              className={clsx("touch-pan-x select-none whitespace-nowrap [-webkit-touch-callout:none]", t === active ? "text-white underline decoration-1 underline-offset-[5px]" : "text-[#bdbdbd] hover:text-white")}
            >
              {labels[t] ?? t}
            </button>
            {t === active && (
              <button type="button" onClick={(e) => setM({ x: e.clientX, y: e.clientY + 8, tab: t, panel: true })} className="text-[#bdbdbd] hover:text-white" aria-label="Menu pannello">
                <MenuIcon size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="relative min-h-0 flex-1 overflow-auto">
        {active ? (
          render(active)
        ) : (
          <div className="grid h-full place-items-center p-1 text-center text-[11px] font-semibold text-[#2d8ceb]">Lascia qui</div>
        )}
      </div>
      {m && <ContextMenu x={m.x} y={m.y} items={[...(m.panel && menu ? [...menu(m.tab), "-" as const] : []), ...tabMenu(m.tab)]} onClose={() => setM(null)} />}
    </section>
  );
}

export function CloseX({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-[#9a9a9a] hover:text-white" aria-label="Chiudi">
      <X size={13} />
    </button>
  );
}

/** true mentre si trascina una scheda (per mostrare le zone libere dove lasciarla). */
export const useDockDragging = () => useDrag((s) => s.tab !== null);

export interface DockRow {
  id: string;
  zones: string[];
}

type Weights = Record<string, number>;

/**
 * Disposizione libera a righe: ogni riga ha più zone affiancate. Le zone
 * senza pannelli spariscono e lasciano spazio alle altre; mentre si trascina
 * una scheda ricompaiono come strisce dove lasciarla, così un pannello si
 * può mettere ovunque (anche in una colonna o riga nuova). Le dimensioni si
 * cambiano trascinando i divisori e restano salvate.
 */
export function DockRows({
  layout,
  rows,
  storageKey,
  defaults,
  zone,
  extras,
  between,
}: {
  layout: ReturnType<typeof useDockLayout>;
  rows: DockRow[];
  storageKey: string;
  /** pesi iniziali di righe e zone (si usano in proporzione) */
  defaults: Weights;
  zone: (id: string, className?: string, style?: React.CSSProperties) => ReactNode;
  /** elementi fissi in una riga (es. la barra degli strumenti), dopo una zona o all'inizio */
  extras?: Record<string, { after?: string; node: ReactNode }>;
  /** elemento fisso tra la prima e la seconda riga (es. barra comandi sul telefono) */
  between?: ReactNode;
}) {
  const dragging = useDockDragging();
  const [w, setW] = useState<Weights>(() => {
    try {
      return { ...defaults, ...(JSON.parse(localStorage.getItem(storageKey) ?? "{}") as Weights) };
    } catch {
      return defaults;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(w));
    } catch {
      /* niente */
    }
  }, [w, storageKey]);
  const weight = (id: string) => w[id] ?? defaults[id] ?? 1;
  const filled = (id: string) => (layout.zones[id]?.tabs.length ?? 0) > 0;

  /** sposta peso tra due elementi vicini, in proporzione allo spostamento del divisore */
  const transfer = (a: string, b: string, deltaPx: number, sizePx: number, sum: number) =>
    setW((cur) => {
      const wa = cur[a] ?? defaults[a] ?? 1;
      const wb = cur[b] ?? defaults[b] ?? 1;
      const d = (deltaPx / Math.max(1, sizePx)) * sum;
      const min = sum * 0.08;
      const na = Math.max(min, Math.min(wa + wb - min, wa + d));
      return { ...cur, [a]: na, [b]: wa + wb - na };
    });

  const gutter = (dir: "x" | "y", a: string, b: string, sum: number) => (
    <div
      key={`g-${a}-${b}`}
      className={clsx("shrink-0 touch-none bg-[#0f0f0f] hover:bg-[#2d8ceb]/60", dir === "x" ? "w-[4px] cursor-col-resize" : "h-[4px] cursor-row-resize")}
      onPointerDown={(e) => {
        const el = e.currentTarget;
        const box = (el.parentElement as HTMLElement).getBoundingClientRect();
        const size = dir === "x" ? box.width : box.height;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* niente */
        }
        let last = dir === "x" ? e.clientX : e.clientY;
        const move = (ev: PointerEvent) => {
          const v = dir === "x" ? ev.clientX : ev.clientY;
          transfer(a, b, v - last, size, sum);
          last = v;
        };
        const up = () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerup", up);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
      }}
    />
  );

  const strip = (id: string, dir: "x" | "y") => zone(id, dir === "x" ? "w-[64px] shrink-0 opacity-80" : "h-[56px] shrink-0 opacity-80");

  const visibleRows = rows.filter((r) => dragging || r.zones.some(filled));
  const rowSum = visibleRows.filter((r) => r.zones.some(filled)).reduce((s, r) => s + weight(r.id), 0);
  const out: ReactNode[] = [];
  visibleRows.forEach((r, ri) => {
    const real = r.zones.filter(filled);
    const sum = real.reduce((s, z) => s + weight(z), 0);
    const items: ReactNode[] = [];
    const extra = extras?.[r.id];
    if (extra && (!extra.after || !filled(extra.after))) items.push(<div key="extra">{extra.node}</div>);
    let prev: string | null = null;
    for (const z of r.zones) {
      if (!filled(z)) {
        if (dragging) items.push(<div key={z} className={real.length ? "flex shrink-0" : "flex min-w-0 flex-1"}>{real.length ? strip(z, "x") : zone(z, "min-w-0 flex-1 opacity-80")}</div>);
        continue;
      }
      if (prev) items.push(gutter("x", prev, z, sum));
      items.push(
        <div key={z} className="flex min-w-[140px]" style={{ flex: `${weight(z) / (sum || 1)} 1 0px` }}>
          {zone(z, "min-w-0 flex-1")}
        </div>,
      );
      if (extra?.after === z) items.push(<div key="extra" className="flex shrink-0">{extra.node}</div>);
      prev = z;
    }
    const rowFilled = real.length > 0;
    const prevRow = visibleRows.slice(0, ri).filter((x) => x.zones.some(filled)).at(-1);
    if (ri > 0) {
      if (rowFilled && prevRow) out.push(gutter("y", prevRow.id, r.id, rowSum));
      if (ri === 1 && between) out.push(<div key="between" className="shrink-0">{between}</div>);
    }
    out.push(
      <div key={r.id} className={clsx("flex min-h-0 gap-0", rowFilled ? "min-h-[90px]" : "h-[56px] shrink-0")} style={rowFilled ? { flex: `${weight(r.id) / (rowSum || 1)} 1 0px` } : undefined}>
        {items}
      </div>,
    );
  });
  if (between && visibleRows.length < 2) out.push(<div key="between" className="shrink-0">{between}</div>);
  return <div className="flex min-h-0 flex-1 flex-col p-1">{out}</div>;
}
