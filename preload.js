const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('safeTimers', {
  setTimeout: (callback, delay) => setTimeout(callback, delay),
  setInterval: (callback, interval) => setInterval(callback, interval),
  clearTimeout: (id) => clearTimeout(id),
  clearInterval: (id) => clearInterval(id)
});

contextBridge.exposeInMainWorld('electronAPI', {
  scanDirectory: (dirPath) => ipcRenderer.invoke('scan-directory', dirPath),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog')
});