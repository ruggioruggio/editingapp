
let exitFn: (() => void) | null = null;

export const setStudioExit = (fn: (() => void) | null) => {
  exitFn = fn;
};

export const isEmbedded = () => exitFn !== null;

export function studioExit(href: string) {
  if (exitFn) exitFn();
  else window.location.href = href;
}
