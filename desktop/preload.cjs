const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("squeakDesktop", {
  openOAuth: (url) => ipcRenderer.send("oauth-start", url),
});
