const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("squeakDesktop", {
  getOAuthPort: () => ipcRenderer.invoke("oauth-port"),
});
