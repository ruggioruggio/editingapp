"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { create } from "zustand";
import { Menu as MenuIcon, X } from "lucide-react";
import { ContextMenu } from "./chrome";
import type { MenuItemLike } from "@/lib/studio/premiere";

// Pannelli agganciabili come nei programmi Adobe: ogni zona ha le sue schede e
// una scheda si sposta in un'altra zona trascinandola (col mouse) oppure
// tenendola premuta e scegliendo dove metterla (dal telefono). La disposizione
// resta salvata nel dispositivo.

export type Zones = Record<string, { tabs: string[]; active: string }>;

export function useDockLayout(storageKey: string, defaults: Zones, available: string[]) {
  const sanitize = useCallback(
    (z: Zones): Zones => {
      const out: Zones = {};
      const seen = new Set<string>();
      for (const id of Object.keys(defaults)) {
        const tabs = (z[id]?.tabs ?? []).filter((t) => available.includes(t) && !seen.has(t));
        tabs.forEach((t) => seen.add(t));
        out[id] = { tabs, active: tabs.includes(z[id]?.active) ? z[id].active : tabs[0] ?? "" };
      }
      // pannelli nuovi o persi tornano nella loro zona predefinita
      for (const [id, d] of Object.entries(defaults))
        for (const t of d.tabs)
          if (!seen.has(t) && available.includes(t)) {
            out[id].tabs.push(t);
            seen.add(t);
            if (!out[id].active) out[id].active = t;
          }
      return out;
    },
    [defaults, available],
  );
  const [zones, setZones] = useState<Zones>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return sanitize(JSON.parse(raw) as Zones);
    } catch {
      /* layout predefinito */
    }
    return sanitize(defaults);
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(zones));
    } catch {
      /* niente */
    }
  }, [zones, storageKey]);

  const move = useCallback((tab: string, to: string, index?: number) => {
    setZones((z) => {
      const from = Object.keys(z).find((k) => z[k].tabs.includes(tab));
      if (!from || !z[to]) return z;
      const next: Zones = Object.fromEntries(Object.entries(z).map(([k, v]) => [k, { ...v, tabs: v.tabs.filter((t) => t !== tab) }]));
      const tabs = [...next[to].tabs];
      tabs.splice(index ?? tabs.length, 0, tab);
      next[to] = { tabs, active: tab };
      if (from !== to && next[from].active === tab) next[from].active = next[from].tabs[0] ?? "";
      return next;
    });
  }, []);
  const activate = useCallback((zone: string, tab: string) => setZones((z) => ({ ...z, [zone]: { ...z[zone], active: tab } })), []);
  /** porta in primo piano la scheda, ovunque sia */
  const show = useCallback((tab: string) => setZones((z) => {
    const k = Object.keys(z).find((id) => z[id].tabs.includes(tab));
    return k ? { ...z, [k]: { ...z[k], active: tab } } : z;
  }), []);
  const reset = useCallback(() => setZones(sanitize(defaults)), [defaults, sanitize]);
  return { zones, move, activate, show, reset };
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

  const moveMenu = (tab: string): MenuItemLike[] => [
    {
      label: "Sposta pannello in",
      sub: Object.keys(layout.zones)
        .filter((z) => z !== id)
        .map((z) => ({ label: zoneNames[z] ?? z, action: () => layout.move(tab, z) })),
    },
    { label: "Ripristina disposizione pannelli", action: layout.reset },
  ];

  const startDrag = (e: React.PointerEvent, tab: string) => {
    if (e.button !== 0) return;
    const x0 = e.clientX;
    const y0 = e.clientY;
    const touch = e.pointerType !== "mouse";
    let dragging = false;
    // dal telefono: tieni premuto per scegliere dove spostare la scheda
    const timer = touch ? setTimeout(() => setM({ x: x0, y: y0, tab }), 550) : undefined;
    const move = (ev: PointerEvent) => {
      if (touch) {
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) clearTimeout(timer);
        return;
      }
      if (!dragging && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return;
      dragging = true;
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>("[data-dock-zone]");
      useDrag.setState({ tab, label: labels[tab] ?? tab, x: ev.clientX, y: ev.clientY, over: el?.dataset.dockZone ?? null });
    };
    const up = () => {
      clearTimeout(timer);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const target = useDrag.getState().over;
      if (dragging && target) layout.move(tab, target);
      useDrag.setState({ tab: null, over: null });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
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
                setM({ x: e.clientX, y: e.clientY, tab: t });
              }}
              title="Trascina la scheda in un altro pannello per spostarla"
              className={clsx("select-none whitespace-nowrap", t === active ? "text-white underline decoration-1 underline-offset-[5px]" : "text-[#bdbdbd] hover:text-white")}
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
      <div className="relative min-h-0 flex-1">
        {active ? (
          render(active)
        ) : (
          <div className="grid h-full place-items-center p-4 text-center text-[12px] text-[#7a7a7a]">
            <span>
              Pannello vuoto: trascina qui una scheda
              <br />
              (dal telefono tieni premuta una scheda)
            </span>
          </div>
        )}
      </div>
      {m && (
        <ContextMenu
          x={m.x}
          y={m.y}
          items={[...(m.panel && menu ? [...menu(m.tab), "-" as const] : []), ...moveMenu(m.tab)]}
          onClose={() => setM(null)}
        />
      )}
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
