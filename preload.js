const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('safeTimers', {
  setTimeout: (callback, delay) => setTimeout(callback, delay),
  setInterval: (callback, interval) => setInterval(callback, interval),
  clearTimeout: (id) => clearTimeout(id),
  clearInterval: (id) => clearInterval(id)
});