// SqueakEdit per Windows, Mac e Linux: una finestra che apre l'app
// (la stessa del sito, in un unico file) anche senza connessione.
const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");

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
}

// su Mac il menu serve per copia/incolla (Cmd+C, Cmd+V); altrove non serve
if (process.platform !== "darwin") Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
