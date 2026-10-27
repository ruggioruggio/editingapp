// SqueakEdit per Windows, Mac e Linux: una finestra che apre l'app
// (la stessa del sito, in un unico file) anche senza connessione.
const { app, BrowserWindow, Menu, globalShortcut, shell } = require("electron");
const path = require("node:path");

const PROTOCOL = "squeakedit";

if (process.defaultApp) {
  if (process.argv.length >= 2) app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

let mainWin = null;

function handleDeepLink(url) {
  if (!mainWin) return;
  const hash = url.split("#")[1];
  if (hash) {
    mainWin.webContents.executeJavaScript(`window.dispatchEvent(new CustomEvent("squeakedit-oauth",{detail:"${hash}"}));`);
  }
  mainWin.focus();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: "#121212",
    title: "SqueakEdit",
    icon: path.join(__dirname, "build", "icon.png"),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  mainWin = win;
  win.loadFile(path.join(__dirname, "app", "index.html"));
  // i link esterni (Discord, siti…) si aprono nel browser
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

// su Mac il menu serve per copia/incolla (Cmd+C, Cmd+V); altrove non serve
if (process.platform !== "darwin") Menu.setApplicationMenu(null);

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); } else {
  app.on("second-instance", (_e, argv) => {
    const deepLink = argv.find((a) => a.startsWith(PROTOCOL + "://"));
    if (deepLink) handleDeepLink(deepLink);
    if (mainWin) { if (mainWin.isMinimized()) mainWin.restore(); mainWin.focus(); }
  });
  app.on("open-url", (_e, url) => handleDeepLink(url));
  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
  });
  app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
}
