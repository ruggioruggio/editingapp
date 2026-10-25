"use client";

import { useEffect, type ReactNode } from "react";
import clsx from "clsx";
import { ArrowLeftToLine, MousePointer2, Redo2, Scissors, Trash2, Undo2, type LucideIcon } from "lucide-react";
import { sequenceDuration } from "@/lib/editor/ops";
import { useEditor } from "@/lib/editor/store";
import type { Tool } from "@/lib/editor/types";
import { ProgramMonitor } from "./ProgramMonitor";
import { Timeline } from "./Timeline";

const TOOL_META: Record<Tool, { label: string; key: string; icon: LucideIcon }> = {
  select: { label: "Selezione", key: "V", icon: MousePointer2 },
  razor: { label: "Lama", key: "C", icon: Scissors },
};

/** Scorciatoie da tastiera uguali a Premiere Pro. */
function useEditorShortcuts(tools: Tool[]) {
  const toolsKey = tools.join(",");
  useEffect(() => {
    const allowed = toolsKey.split(",");
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const s = useEditor.getState();
      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && key === "z") {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === "y") {
        e.preventDefault();
        s.redo();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (key === "v" && allowed.includes("select")) s.setTool("select");
      else if (key === "c" && allowed.includes("razor")) s.setTool("razor");
      else if (key === " ") {
        e.preventDefault();
        s.togglePlay();
      } else if (key === "delete" || key === "backspace") {
        e.preventDefault();
        s.deleteSelection(e.shiftKey);
      } else if (key === "arrowleft") {
        e.preventDefault();
        s.setPlayhead(s.playhead - 1 / s.seq.fps);
      } else if (key === "arrowright") {
        e.preventDefault();
        s.setPlayhead(s.playhead + 1 / s.seq.fps);
      } else if (key === "home") {
        s.setPlayhead(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toolsKey]);
}

function usePlayback() {
  const playing = useEditor((s) => s.playing);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const { playhead, seq, setPlayhead, setPlaying } = useEditor.getState();
      const next = playhead + (now - last) / 1000;
      last = now;
      const end = sequenceDuration(seq);
      if (next >= end) {
        setPlayhead(end);
        setPlaying(false);
        return;
      }
      setPlayhead(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => () => useEditor.getState().setPlaying(false), []);
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="hidden rounded border border-line bg-panel-3 px-1 font-mono text-[10px] text-ink-mute sm:inline">
      {children}
    </kbd>
  );
}

function ActionButton({
  onClick,
  disabled,
  active,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      aria-pressed={active}
      // blur: altrimenti lo Spazio "ri-clicca" il bottone invece di avviare il play
      onClick={(e) => {
        onClick();
        e.currentTarget.blur();
      }}
      className={clsx(
        "flex items-center gap-1.5 rounded px-2 py-1.5 text-xs transition-colors disabled:opacity-35",
        active ? "bg-accent text-white" : "text-ink-dim enabled:hover:bg-panel-3 enabled:hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function MiniEditor({ tools }: { tools: Tool[] }) {
  const tool = useEditor((s) => s.tool);
  const hasSelection = useEditor((s) => s.selection.length > 0);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const { setTool, deleteSelection, undo, redo } = useEditor.getState();

  useEditorShortcuts(tools);
  usePlayback();

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-[#0f0f0f] p-1.5">
      <ProgramMonitor />

      <div className="flex min-w-0 gap-1.5">
        {/* Pannello Strumenti verticale, come in Premiere (solo desktop) */}
        <div className="hidden w-10 shrink-0 flex-col items-center gap-1 rounded-md border border-line bg-panel py-1.5 sm:flex">
          {tools.map((t) => {
            const { label, key, icon: Icon } = TOOL_META[t];
            return (
              <button
                key={t}
                type="button"
                title={`${label} (${key})`}
                aria-pressed={tool === t}
                onClick={(e) => {
                  setTool(t);
                  e.currentTarget.blur();
                }}
                className={clsx(
                  "grid h-8 w-8 place-items-center rounded",
                  tool === t ? "bg-accent text-white" : "text-ink-dim hover:bg-panel-3 hover:text-ink",
                )}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
        <div className="min-w-0 flex-1">
          <Timeline />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-md border border-line bg-panel px-1.5 py-1">
        <div className="flex gap-1 sm:hidden">
          {tools.map((t) => {
            const { label, icon: Icon } = TOOL_META[t];
            return (
              <ActionButton key={t} title={label} active={tool === t} onClick={() => setTool(t)}>
                <Icon size={14} /> {label}
              </ActionButton>
            );
          })}
        </div>
        <ActionButton title="Elimina (Canc)" disabled={!hasSelection} onClick={() => deleteSelection(false)}>
          <Trash2 size={14} /> Elimina <Kbd>Canc</Kbd>
        </ActionButton>
        <ActionButton
          title="Elimina con increspatura (Shift+Canc)"
          disabled={!hasSelection}
          onClick={() => deleteSelection(true)}
        >
          <ArrowLeftToLine size={14} /> Increspatura <Kbd>⇧ Canc</Kbd>
        </ActionButton>
        <div className="ml-auto flex gap-1">
          <ActionButton title="Annulla (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
            <Undo2 size={14} />
          </ActionButton>
          <ActionButton title="Ripeti (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
            <Redo2 size={14} />
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
