const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('safeTimers', {
  setTimeout: (callback, delay) => setTimeout(callback, delay),
  setInterval: (callback, interval) => setInterval(callback, interval),
  clearTimeout: (id) => clearTimeout(id),
  clearInterval: (id) => clearInterval(id)
});

contextBridge.exposeInMainWorld('electronAPI', {
  scanDirectory: (dirPath) => ipcRenderer.invoke('scan-directory', dirPath),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  saveAppsToDatabase: (folderPath, folderName, apps) => 
    ipcRenderer.invoke('save-apps-to-database', folderPath, folderName, apps),
  getAppsFromDatabase: () => ipcRenderer.invoke('get-apps-from-database'),
  deleteApp: (appId) => ipcRenderer.invoke('delete-app', appId),
  deleteFolder: (folderId) => ipcRenderer.invoke('delete-folder', folderId),
  launchApp: (appId, appPath) => ipcRenderer.invoke('launch-app', appId, appPath)
});