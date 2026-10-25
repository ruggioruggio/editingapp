const pad = (n: number) => String(n).padStart(2, "0");

/** HH:MM:SS:FF come nel monitor di Premiere. */
export function formatTimecode(seconds: number, fps: number): string {
  const totalFrames = Math.max(0, Math.round(seconds * fps));
  const ff = totalFrames % fps;
  const totalSec = Math.floor(totalFrames / fps);
  return `${pad(Math.floor(totalSec / 3600))}:${pad(Math.floor(totalSec / 60) % 60)}:${pad(totalSec % 60)}:${pad(ff)}`;
}

/** Arrotonda al fotogramma più vicino: in un NLE non si taglia "a metà frame". */
export const toFrame = (t: number, fps: number) => Math.round(t * fps) / fps;
