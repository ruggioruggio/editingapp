import { create } from "zustand";
import { useProgress } from "@/lib/progress/store";
import { deleteClips, linkedGroup, razor, sequenceDuration } from "./ops";
import { toFrame } from "./timecode";
import type { Sequence, Tool } from "./types";

const HISTORY_LIMIT = 50;

interface EditorState {
  seq: Sequence;
  past: Sequence[];
  future: Sequence[];
  viewDuration: number;
  tool: Tool;
  selection: string[];
  playhead: number;
  playing: boolean;

  load: (seq: Sequence) => void;
  setTool: (tool: Tool) => void;
  select: (clipId: string | null) => void;
  setPlayhead: (t: number) => void;
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  razorAt: (clipId: string, t: number) => void;
  deleteSelection: (ripple: boolean) => void;
  undo: () => void;
  redo: () => void;
}

const emptySequence: Sequence = { name: "Sequenza 01", fps: 25, media: [], clips: [], markers: [] };

export const useEditor = create<EditorState>()((set, get) => {
  const commit = (next: Sequence): boolean => {
    const { seq, past, selection } = get();
    if (next === seq) return false;
    const alive = new Set(next.clips.map((c) => c.id));
    set({
      seq: next,
      past: [...past, seq].slice(-HISTORY_LIMIT),
      future: [],
      selection: selection.filter((id) => alive.has(id)),
    });
    return true;
  };

  return {
    seq: emptySequence,
    past: [],
    future: [],
    viewDuration: 10,
    tool: "select",
    selection: [],
    playhead: 0,
    playing: false,

    load: (seq) => {
      const copy = structuredClone(seq);
      set({
        seq: copy,
        past: [],
        future: [],
        selection: [],
        playhead: 0,
        playing: false,
        tool: "select",
        viewDuration: Math.max(5, Math.ceil(sequenceDuration(copy) * 1.08)),
      });
    },
    setTool: (tool) => set({ tool }),
    select: (clipId) => set({ selection: clipId ? linkedGroup(get().seq, clipId).map((c) => c.id) : [] }),
    setPlayhead: (t) => set({ playhead: Math.max(0, Math.min(t, get().viewDuration)) }),
    setPlaying: (playing) => set({ playing }),
    togglePlay: () => {
      const { playing, playhead, seq } = get();
      if (!playing && playhead >= sequenceDuration(seq) - 1e-3) set({ playhead: 0 });
      set({ playing: !playing });
    },
    razorAt: (clipId, t) => {
      if (commit(razor(get().seq, clipId, toFrame(t, get().seq.fps)))) useProgress.getState().recordStat("cuts");
    },
    deleteSelection: (ripple) => {
      if (commit(deleteClips(get().seq, get().selection, ripple)) && ripple) useProgress.getState().recordStat("ripples");
    },
    undo: () => {
      const { past, seq, future } = get();
      const prev = past.at(-1);
      if (!prev) return;
      set({ seq: prev, past: past.slice(0, -1), future: [seq, ...future], selection: [] });
    },
    redo: () => {
      const { past, seq, future } = get();
      const [next, ...rest] = future;
      if (!next) return;
      set({ seq: next, past: [...past, seq], future: rest, selection: [] });
    },
  };
});
