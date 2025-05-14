const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'electron',
  {
    getAppVersion: () => ipcRenderer.sendSync('app-version')
  }
);
