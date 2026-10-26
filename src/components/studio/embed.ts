// Quando un simulatore è aperto dentro una lezione, "Home", "Chiudi" e
// "Torna alle lezioni" chiudono l'esercizio invece di cambiare pagina.

let exitFn: (() => void) | null = null;

export const setStudioExit = (fn: (() => void) | null) => {
  exitFn = fn;
};

export const isEmbedded = () => exitFn !== null;

/** Esce dal simulatore: chiude l'esercizio della lezione oppure va alla pagina indicata. */
export function studioExit(href: string) {
  if (exitFn) exitFn();
  else window.location.href = href;
}
