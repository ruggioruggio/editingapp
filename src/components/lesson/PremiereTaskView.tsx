"use client";

import { useState } from "react";
import { MonitorPlay } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { ExportDialog } from "@/components/premiere/ExportDialog";
import { SequenceDialog } from "@/components/premiere/SequenceDialog";
import type { ExportSettings, PremiereStep, SequenceSettings } from "@/lib/lessons/types";
import { RichText } from "./RichText";

const fpsText = (f: number) => String(f).replace(".", ",");

export function PremiereTaskView({ step, onDone, onMistake }: { step: PremiereStep; onDone: () => void; onMistake: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const fail = (problems: string[]) => {
    setError(`Quasi! Controlla: ${problems.join(", ")}.`);
    onMistake();
  };
  const succeed = () => {
    setError(null);
    setDone(true);
    onDone();
  };

  const confirmSequence = (s: SequenceSettings) => {
    if (step.dialog !== "sequence" || done) return;
    const g = step.goal;
    const problems: string[] = [];
    if (s.width !== g.width || s.height !== g.height) problems.push(`dimensione ${g.width}×${g.height} (ora ${s.width}×${s.height})`);
    if (Math.abs(s.fps - g.fps) > 0.01) problems.push(`base temporale ${fpsText(g.fps)} fps (ora ${fpsText(s.fps)})`);
    if (g.name && s.name.trim().toLowerCase() !== g.name.toLowerCase()) problems.push(`nome "${g.name}"`);
    if (problems.length) fail(problems);
    else succeed();
  };

  const confirmExport = (s: ExportSettings) => {
    if (step.dialog !== "export" || done) return false;
    const g = step.goal;
    const problems: string[] = [];
    if (s.format !== g.format) problems.push(`formato ${g.format}`);
    if (s.width !== g.width || s.height !== g.height) problems.push(`dimensione ${g.width}×${g.height}`);
    if (Math.abs(s.fps - g.fps) > 0.01) problems.push(`${fpsText(g.fps)} fps`);
    if (s.bitrateMbps < g.minMbps || s.bitrateMbps > g.maxMbps) problems.push(`bitrate tra ${g.minMbps} e ${g.maxMbps} Mbps`);
    if (g.audioKbps && s.audioKbps !== g.audioKbps) problems.push(`audio ${g.audioKbps} kbps`);
    if (problems.length) {
      fail(problems);
      return false;
    }
    setError(null);
    setTimeout(succeed, 1200);
    return true;
  };

  return (
    <div className="animate-pop space-y-4">
      <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#9999ff]">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#9999ff] text-[#121212]">
          <MonitorPlay size={15} />
        </span>
        Tutorial in Premiere
      </p>
      <div className="flex items-center gap-4">
        <Mascot size={72} idle mood={done ? "wow" : "happy"} className="shrink-0" />
        <div className="duo-bubble min-w-0">
          <p className="font-black">{step.title}</p>
          <RichText text={step.instructions} className="text-sm leading-relaxed text-ink-dim" />
        </div>
      </div>
      {step.dialog === "sequence" ? (
        <SequenceDialog onConfirm={confirmSequence} error={error} />
      ) : (
        <ExportDialog source={{ width: 1920, height: 1080, fps: 25, seconds: 95 }} onExport={confirmExport} error={error} fileName="Intervista_Montaggio" />
      )}
    </div>
  );
}
