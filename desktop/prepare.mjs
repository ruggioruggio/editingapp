// Prepara la pagina dell'app: la stessa anteprima a file unico del sito.
// Con SQUEAK_NO_ADMIN=1 il pannello admin non è disponibile (per le build pubbliche).
// Uso: node prepare.mjs <file-di-uscita.html>
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const out = resolve(process.cwd(), process.argv[2] ?? "app/index.html");
execFileSync(process.execPath, [resolve(import.meta.dirname, "../preview/build.mjs"), out], {
  stdio: "inherit",
});
