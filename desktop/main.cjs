// SqueakEdit per Windows, Mac e Linux: una finestra che apre l'app
// (la stessa del sito, in un unico file) anche senza connessione.
const { app, BrowserWindow, Menu, shell } = require("electron");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const LOG_FILE = path.join(app.getPath("userData"), "oauth-debug.log");
function dbg(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG_FILE, line); } catch {}
}
dbg("main.cjs avviato");

const OAUTH_PORT = 19274;
let mainWin = null;

// --- OAuth: server HTTP locale per ricevere il callback ---
// Il browser di sistema fa il login → Supabase redirige a http://localhost:19274?code=xxx
// → il server locale lo cattura e lo manda alla finestra Electron.
function startOAuthServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const code = url.searchParams.get("code");
    dbg("Richiesta ricevuta: " + req.url + " code: " + (code ? "SI" : "NO"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    if (code && mainWin && !mainWin.isDestroyed()) {
      res.end(`<html><body style="background:#121212;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center"><div><h2 style="color:#3ecf8e">Login riuscito!</h2><p>Torna a SqueakEdit. Puoi chiudere questa pagina.</p></div></body></html>`);
      const payload = JSON.stringify({ code });
      dbg("Invio code alla finestra: " + code.substring(0, 8) + "...");
      mainWin.webContents.executeJavaScript(
        `console.log("[OAuth main→renderer] code ricevuto"); window.dispatchEvent(new CustomEvent("squeakedit-oauth",{detail:${JSON.stringify(payload)}}));`
      ).then(() => dbg("executeJavaScript OK")).catch((e) => dbg("executeJavaScript ERRORE: " + e.message));
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    } else {
      const err = url.searchParams.get("error_description") || url.searchParams.get("error") || "Errore sconosciuto";
      res.end(`<html><body style="background:#121212;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h2 style="color:#ed4245">Errore: ${err}</h2></body></html>`);
    }
  });
  server.listen(OAUTH_PORT, () => {
    dbg("Server OAuth in ascolto su porta " + OAUTH_PORT);
  });
  server.on("error", (e) => { dbg("ERRORE server: " + e.message); });
}

// --- Finestra principale ---
function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 980, minHeight: 620,
    backgroundColor: "#121212",
    title: "SqueakEdit",
    icon: path.join(__dirname, "build", "icon.png"),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  mainWin = win;
  win.loadFile(path.join(__dirname, "app", "index.html"));

  // Inietta la porta OAuth nella pagina (usata da OAuthButtons.tsx)
  win.webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript(`window.__OAUTH_PORT__=${OAUTH_PORT};`);
  });

  // Link esterni si aprono nel browser di sistema
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file:")) {
      e.preventDefault();
      if (/^https?:/i.test(url)) shell.openExternal(url);
    }
  });

  // F11 per schermo intero
  win.webContents.on("before-input-event", (e, input) => {
    if (input.key === "F11" && input.type === "keyDown") {
      e.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    }
  });
  win.on("closed", () => { mainWin = null; });
}

// su Mac il menu serve per copia/incolla; altrove non serve
if (process.platform !== "darwin") Menu.setApplicationMenu(null);

const gotLock = app.requestSingleInstanceLock();
dbg("gotLock: " + gotLock);
if (!gotLock) { dbg("ALTRA ISTANZA - esco"); app.quit(); } else {
  app.on("second-instance", () => {
    if (mainWin) { if (mainWin.isMinimized()) mainWin.restore(); mainWin.focus(); }
  });
  app.whenReady().then(() => {
    dbg("app.whenReady() - avvio server e finestra");
    startOAuthServer();
    createWindow();
    app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
  });
  app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
}
