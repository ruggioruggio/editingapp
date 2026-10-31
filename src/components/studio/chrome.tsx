"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import clsx from "clsx";
import { Check, ChevronRight, Menu as MenuIcon, X } from "lucide-react";
import type { MenuItemLike } from "@/lib/studio/premiere";

export type { MenuItemLike };
export type Menu = { label: string; items: MenuItemLike[] };

export function timecode(t: number, fps: number, sep = ":") {
  const r = Math.round(fps);
  const f = Math.round(Math.max(0, t) * r);
  const ff = f % r;
  const s = Math.floor(f / r);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}${sep}${p(Math.floor(s / 60) % 60)}${sep}${p(s % 60)}${sep}${p(ff)}`;
}

export function MenuList({ items, onClose, className, style }: { items: MenuItemLike[]; onClose: () => void; className?: string; style?: React.CSSProperties }) {
  const [sub, setSub] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [flip, setFlip] = useState(false);
  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (r && r.right + 200 > window.innerWidth) setFlip(true);
  }, []);
  return (
    <div
      ref={ref}
      className={clsx("min-w-56 rounded-md border border-[#0c0c0c] bg-[#2b2b2b] py-1 text-[12.5px] text-[#d6d6d6] shadow-[0_12px_32px_rgb(0_0_0/0.65)]", className)}
      style={style}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {items.map((it, k) =>
        it === "-" ? (
          <div key={k} className="my-1 border-t border-[#3f3f3f]" />
        ) : (
          <div key={k} className="relative" onPointerEnter={() => setSub(it.sub ? k : null)}>
            <button
              type="button"
              disabled={it.disabled}
              onClick={() => {
                if (it.sub) return setSub(k);
                onClose();
                it.action?.();
              }}
              className={clsx(
                "relative flex w-full items-center gap-2 py-[5px] pl-7 pr-4 text-left disabled:text-[#6a6a6a]",
                !it.disabled && "hover:bg-[#2680eb] hover:text-white",
                sub === k && "bg-[#2680eb] text-white",
              )}
            >
              {it.checked && <Check size={12} className="absolute left-2" />}
              <span className="flex-1 whitespace-nowrap">{it.label}</span>
              {it.keys && <span className="whitespace-nowrap pl-6 text-[11px] text-[#9a9a9a]">{it.keys}</span>}
              {it.sub && <ChevronRight size={13} />}
            </button>
            {it.sub && sub === k && <MenuList items={it.sub} onClose={onClose} className={clsx("absolute top-[-5px] z-10", flip ? "right-full" : "left-full")} />}
          </div>
        ),
      )}
    </div>
  );
}

export function MenuBar({ app, menus, right }: { app: string; menus: Menu[]; right?: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open === null) return;
    const close = () => setOpen(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  const place = (el: HTMLElement) => setLeft(el.getBoundingClientRect().left - (ref.current?.getBoundingClientRect().left ?? 0));
  return (
    <div ref={ref} className="relative z-50 flex h-[26px] shrink-0 items-center bg-[#2a2a2a] px-3 text-[13px] text-[#e8e8e8]">
      <span className="mr-3 whitespace-nowrap font-bold">{app}</span>
      <div className="flex min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {menus.map((m, i) => (
          <button
            key={m.label}
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              place(e.currentTarget);
              setOpen(open === i ? null : i);
            }}
            onPointerEnter={(e) => {
              if (open === null) return;
              place(e.currentTarget);
              setOpen(i);
            }}
            className={clsx("whitespace-nowrap rounded px-2.5 py-[2px]", open === i ? "bg-[#3d3d3d]" : "hover:bg-[#353535]")}
          >
            {m.label}
          </button>
        ))}
      </div>
      {open !== null && <MenuList items={menus[open].items} onClose={() => setOpen(null)} className="absolute top-[25px]" style={{ left: Math.max(0, left) }} />}
      <div className="ml-auto flex shrink-0 items-center gap-3 pl-3 text-[12px] text-[#bdbdbd]">{right}</div>
    </div>
  );
}

export function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: MenuItemLike[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: Math.max(0, Math.min(x, window.innerWidth - r.width - 4)), y: Math.max(0, Math.min(y, window.innerHeight - r.height - 4)) });
  }, [x, y]);
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("pointerdown", close);
    window.addEventListener("blur", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("blur", close);
    };
  }, [onClose]);
  return (
    <div ref={ref} className="fixed z-[80]" style={{ left: pos.x, top: pos.y }}>
      <MenuList items={items} onClose={onClose} />
    </div>
  );
}

export function Panel<T extends string>({
  tabs,
  tab,
  onTab,
  children,
  className,
  focused,
  onFocus,
  menu,
  actions,
  onClose,
  style,
}: {
  style?: React.CSSProperties;
  tabs: readonly T[];
  tab: T;
  onTab?: (t: T) => void;
  children: ReactNode;
  className?: string;
  focused?: boolean;
  onFocus?: () => void;
  menu?: MenuItemLike[];
  actions?: ReactNode;
  onClose?: (t: T) => void;
}) {
  const [m, setM] = useState<{ x: number; y: number } | null>(null);
  return (
    <section
      onPointerDownCapture={onFocus}
      style={style}
      className={clsx("relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[4px] border bg-[#1e1e1e]", focused ? "border-[#2d8ceb]" : "border-[#1e1e1e]", className)}
    >
      <div className="flex h-[34px] shrink-0 items-center gap-5 overflow-x-auto px-3 text-[12.5px] [scrollbar-width:none]">
        {tabs.map((t) => (
          <div key={t} className="flex shrink-0 items-center gap-1.5">
            {onClose && t === tab && (
              <button type="button" onClick={() => onClose(t)} className="text-[#9a9a9a] hover:text-white" aria-label="Chiudi">
                <X size={13} />
              </button>
            )}
            <button type="button" onClick={() => onTab?.(t)} className={clsx("whitespace-nowrap", t === tab ? "text-white underline decoration-1 underline-offset-[5px]" : "text-[#bdbdbd] hover:text-white")}>
              {t}
            </button>
            {t === tab && menu && (
              <button type="button" onClick={(e) => setM({ x: e.clientX, y: e.clientY + 8 })} className="text-[#bdbdbd] hover:text-white" aria-label="Menu pannello">
                <MenuIcon size={13} />
              </button>
            )}
          </div>
        ))}
        <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
      {m && menu && <ContextMenu x={m.x} y={m.y} items={menu} onClose={() => setM(null)} />}
    </section>
  );
}

export function Modal({ children, onClose, width = 560 }: { children: ReactNode; onClose: () => void; width?: number }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-3" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width, maxWidth: "100%" }}>{children}</div>
    </div>
  );
}

export function Dialog({
  title,
  children,
  onOk,
  onCancel,
  okLabel = "OK",
  width = 460,
  okDisabled,
}: {
  title: string;
  children: ReactNode;
  onOk: () => void;
  onCancel: () => void;
  okLabel?: string;
  width?: number;
  okDisabled?: boolean;
}) {
  return (
    <Modal onClose={onCancel} width={width}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!okDisabled) onOk();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Escape") onCancel();
        }}
        className="rounded-lg border border-[#0c0c0c] bg-[#252525] text-[12.5px] text-[#d0d0d0] shadow-[0_24px_60px_rgb(0_0_0/0.7)]"
      >
        <div className="flex h-9 items-center px-4 text-[13px] font-semibold text-white">{title}</div>
        <div className="max-h-[70dvh] overflow-y-auto px-4 pb-2">{children}</div>
        <div className="flex justify-end gap-2 px-4 py-3">
          <button type="button" onClick={onCancel} className="h-8 rounded-full border-2 border-[#8a8a8a] px-5 text-[13px] font-semibold text-[#e0e0e0] hover:bg-white/5">
            Annulla
          </button>
          <button type="submit" disabled={okDisabled} className="h-8 rounded-full bg-[#2680eb] px-5 text-[13px] font-semibold text-white hover:bg-[#1473e6] disabled:opacity-40">
            {okLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="pointer-events-none fixed bottom-8 left-1/2 z-[90] -translate-x-1/2 rounded-md border border-black bg-[#323232] px-4 py-2 text-[12.5px] text-white shadow-[0_8px_24px_rgb(0_0_0/0.6)]">
      {text}
    </div>
  );
}

export function KeysHelp({ title, rows, onClose }: { title: string; rows: [string, string][]; onClose: () => void }) {
  const [q, setQ] = useState("");
  const shown = rows.filter(([k, v]) => (k + v).toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal onClose={onClose} width={780}>
      <div className="rounded-lg border border-black bg-[#252525] text-[#c8c8c8] shadow-2xl" onKeyDown={(e) => e.stopPropagation()}>
        <div className="flex h-10 items-center gap-3 px-4 text-[13px] font-semibold text-white">
          {title}
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca comando o tasto" className="ml-auto h-7 w-56 rounded border border-[#3e3e3e] bg-[#1b1b1b] px-2 text-[12px] font-normal outline-none focus:border-[#2680eb]" />
          <button type="button" onClick={onClose} aria-label="Chiudi">
            <X size={15} />
          </button>
        </div>
        <div className="grid max-h-[70dvh] gap-x-8 overflow-y-auto px-4 pb-4 sm:grid-cols-2">
          {shown.map(([k, v]) => (
            <div key={k + v} className="flex items-center justify-between gap-4 border-b border-[#2e2e2e] py-1.5 text-[12px]">
              <span>{v}</span>
              <kbd className="shrink-0 rounded border border-[#4a4a4a] bg-[#1b1b1b] px-1.5 py-0.5 font-mono text-[11px] text-white">{k}</kbd>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export const typing = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
};

export function usePlayback(active: boolean, tick: (dt: number) => void) {
  const cb = useRef(tick);
  useEffect(() => {
    cb.current = tick;
  });
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      cb.current(Math.min(0.1, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

export function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );
}

export function Gutter({ dir, onDrag }: { dir: "x" | "y"; onDrag: (delta: number) => void }) {
  return (
    <div
      className={clsx("shrink-0 touch-none bg-[#0f0f0f] hover:bg-[#2d8ceb]/60", dir === "x" ? "w-[4px] cursor-col-resize" : "h-[4px] cursor-row-resize")}
      onPointerDown={(e) => {
        const el = e.currentTarget;
        try { el.setPointerCapture(e.pointerId); } catch {}
        let last = dir === "x" ? e.clientX : e.clientY;
        const move = (ev: PointerEvent) => {
          const v = dir === "x" ? ev.clientX : ev.clientY;
          onDrag(v - last);
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
}

export function Scrub({
  value,
  onChange,
  step = 1,
  min = -1e6,
  max = 1e6,
  decimals = 1,
  suffix = "",
  disabled,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
  suffix?: string;
  disabled?: boolean;
  className?: string;
}) {
  const drag = useRef<{ x: number; v: number; moved: boolean } | null>(null);
  const [editing, setEditing] = useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  if (editing) {
    return (
      <input
        autoFocus
        defaultValue={value.toFixed(decimals)}
        className="w-16 rounded-sm border border-[#2680eb] bg-[#111] px-1 text-[12px] text-white outline-none"
        onFocus={(e) => e.target.select()}
        onBlur={(e) => {
          const n = Number(e.target.value.replace(",", "."));
          if (!Number.isNaN(n)) onChange(clamp(n));
          setEditing(false);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") setEditing(false);
        }}
      />
    );
  }
  return (
    <span
      role="spinbutton"
      aria-valuenow={value}
      tabIndex={disabled ? -1 : 0}
      className={clsx(
        "touch-none select-none whitespace-nowrap text-[12px] tabular-nums",
        disabled ? "text-[#6a6a6a]" : "cursor-ew-resize text-[#3d9cf0] underline decoration-[#3d9cf0]/50 decoration-dotted underline-offset-2 hover:text-[#6cb6ff]",
        className,
      )}
      onPointerDown={(e) => {
        if (disabled) return;
        e.stopPropagation();
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
        drag.current = { x: e.clientX, v: value, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 2) d.moved = true;
        if (d.moved) onChange(clamp(Number((d.v + dx * step * (e.shiftKey ? 10 : e.ctrlKey ? 0.1 : 1)).toFixed(decimals))));
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (d && !d.moved) setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowRight") onChange(clamp(value + step));
        if (e.key === "ArrowDown" || e.key === "ArrowLeft") onChange(clamp(value - step));
      }}
    >
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export const field = "h-7 rounded-[4px] border border-[#3e3e3e] bg-[#151515] px-2 text-[12px] text-[#e0e0e0] outline-none focus:border-[#2680eb]";
