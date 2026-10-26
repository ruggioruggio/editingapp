// Costruisce l'anteprima di SqueakEdit in un unico file HTML (per gli artefatti
// di Claude, che non hanno server e accettano solo codice in linea).
// Uso: node preview/build.mjs <file-di-uscita.html>
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { build } from "esbuild";

const root = resolve(import.meta.dirname, "..");
// hash lento della password admin (solo per la verifica locale dell'anteprima)
let previewAdminHash = "";
// le app da distribuire (desktop, Android) si costruiscono con SQUEAK_NO_ADMIN=1: niente hash dentro
if (!process.env.SQUEAK_NO_ADMIN) try {
  previewAdminHash = /^ADMIN_PREVIEW_HASH=(.*)$/m.exec(readFileSync(resolve(root, ".env.local"), "utf8"))?.[1]?.trim() ?? "";
} catch {
  /* nessun .env.local: pannello admin non disponibile nell'anteprima */
}
const out = resolve(process.argv[2] ?? resolve(root, "preview/dist/squeakedit.html"));
const tmp = resolve(root, "preview/dist");
mkdirSync(tmp, { recursive: true });
mkdirSync(dirname(out), { recursive: true });

// 1. JavaScript: tutta l'app in un solo bundle, con le parti di Next sostituite
const result = await build({
  entryPoints: [resolve(root, "preview/main.tsx")],
  bundle: true,
  write: false,
  format: "iife",
  minify: true,
  target: "es2020",
  jsx: "automatic",
  tsconfig: resolve(root, "tsconfig.json"),
  alias: {
    "next/link": resolve(root, "preview/shims/link.tsx"),
    "next/navigation": resolve(root, "preview/shims/navigation.ts"),
    "next/dynamic": resolve(root, "preview/shims/dynamic.tsx"),
    "server-only": resolve(root, "preview/shims/empty.ts"),
  },
  define: {
    "process.env.NODE_ENV": '"production"',
    // anteprima solo da ospite: niente account né database
    "process.env.NEXT_PUBLIC_SUPABASE_URL": '""',
    "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": '""',
    "process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": '""',
    "process.env.ADMIN_PREVIEW_HASH": JSON.stringify(previewAdminHash),
  },
  banner: { js: "var process=globalThis.process||{env:{}};" },
  logLevel: "warning",
});
// "</script" dentro il codice chiuderebbe il tag in anticipo
const js = new TextDecoder().decode(result.outputFiles[0].contents).replaceAll("</script", "<\\/script");

// 2. CSS: Tailwind compila globals.css cercando le classi nei sorgenti
const cssIn = resolve(tmp, "input.css");
writeFileSync(
  cssIn,
  `${readFileSync(resolve(root, "src/app/globals.css"), "utf8")}\n@source "../../src";\n@source "../../preview";\n:root{--font-nunito:"Nunito";--font-jetbrains:"JetBrains Mono";}\n`,
);
const cssOut = resolve(tmp, "app.css");
execFileSync(process.execPath, [resolve(root, "node_modules/@tailwindcss/cli/dist/index.mjs"), "-i", cssIn, "-o", cssOut, "--minify"], {
  cwd: root,
  stdio: "inherit",
});
const css = readFileSync(cssOut, "utf8");

// 3. Pagina: niente <html>/<head>/<body>, li aggiunge l'artefatto
const html = `<title>SqueakEdit</title>
<meta name="description" content="Anteprima di SqueakEdit: impara il montaggio video, 3 minuti al giorno.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap">
<style>:root{color-scheme:dark}html,body{background:#121212}${css}</style>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync(out, html);
console.log(`Anteprima scritta in ${out} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
