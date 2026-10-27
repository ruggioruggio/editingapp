"use client";

import { useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

// Piccoli controlli con l'aspetto dell'interfaccia di Premiere/After Effects
// (stile Adobe Spectrum scuro): campi, menu a tendina, numeri trascinabili.

export const P = {
  panel: "bg-[#232323] text-[#c8c8c8]",
  field: "h-7 rounded-[4px] border border-[#3e3e3e] bg-[#1b1b1b] px-2 text-[12px] text-[#e0e0e0] outline-none focus:border-[#2680eb] disabled:opacity-45",
  label: "text-[12px] text-[#9a9a9a]",
};

export function PSelect<T extends string | number>({
  value,
  options,
  onChange,
  disabled,
  className,
  format,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  disabled?: boolean;
  className?: string;
  format?: (v: T) => string;
}) {
  return (
    <span className={clsx("relative inline-flex", className)}>
      <select
        value={String(value)}
        disabled={disabled}
        onChange={(e) => onChange(options.find((o) => String(o) === e.target.value) as T)}
        className={clsx(P.field, "w-full appearance-none pr-7")}
      >
        {options.map((o) => (
          <option key={String(o)} value={String(o)}>
            {format ? format(o) : String(o)}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1.5 text-[#9a9a9a]" />
    </span>
  );
}

export function PNumber({
  value,
  onChange,
  disabled,
  min = 0,
  max = 100000,
  step = 1,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? String(value);
  return (
    <input
      type="number"
      value={display}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== null) {
          const n = Number(draft);
          if (!Number.isNaN(n) && draft !== "") onChange(Math.min(max, Math.max(min, n)));
          setDraft(null);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        e.stopPropagation();
      }}
      className={clsx(P.field, "w-20 tabular-nums", className)}
    />
  );
}

/**
 * Valore blu "trascinabile" come nei Controlli effetti: si trascina in
 * orizzontale per cambiarlo, oppure si fa clic per scriverlo.
 */
export function Scrubby({
  value,
  onChange,
  step = 1,
  min = -100000,
  max = 100000,
  decimals = 1,
  suffix = "",
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  decimals?: number;
  suffix?: string;
}) {
  const drag = useRef<{ x: number; v: number; moved: boolean } | null>(null);
  const [editing, setEditing] = useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  if (editing) {
    return (
      <input
        autoFocus
        defaultValue={value.toFixed(decimals)}
        className="w-16 rounded-sm border border-[#2680eb] bg-[#1b1b1b] px-1 text-[12px] text-white outline-none"
        onBlur={(e) => {
          const n = Number(e.target.value.replace(",", "."));
          if (!Number.isNaN(n)) onChange(clamp(n));
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") setEditing(false);
          e.stopPropagation();
        }}
      />
    );
  }
  return (
    <span
      role="spinbutton"
      aria-valuenow={value}
      tabIndex={0}
      className="cursor-ew-resize select-none text-[12px] tabular-nums text-[#2d8ceb] underline decoration-dotted underline-offset-2 hover:text-[#5aa9ff]"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, v: value, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 2) d.moved = true;
        if (d.moved) onChange(clamp(Number((d.v + dx * step).toFixed(decimals))));
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        // un clic senza trascinare apre il campo per scrivere il valore
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

export function PCheck({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#c8c8c8]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 accent-[#2680eb]" />
      {children}
    </label>
  );
}

export function PButton({ children, primary, onClick, disabled }: { children: ReactNode; primary?: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "h-8 rounded-full px-5 text-[13px] font-semibold transition-colors disabled:opacity-40",
        primary ? "bg-[#2680eb] text-white hover:bg-[#1473e6]" : "border-2 border-[#8a8a8a] text-[#e0e0e0] hover:bg-white/5",
      )}
    >
      {children}
    </button>
  );
}

export function PTabs<T extends string>({ tabs, value, onChange }: { tabs: readonly T[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="flex gap-5 border-b border-[#3a3a3a] px-1">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={clsx("-mb-px border-b-2 pb-2 pt-1 text-[13px]", value === t ? "border-[#2680eb] text-white" : "border-transparent text-[#9a9a9a] hover:text-[#d0d0d0]")}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] items-center gap-2 py-1 max-sm:grid-cols-1">
      <span className={P.label}>{label}</span>
      <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
