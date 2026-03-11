const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    closeWindow: () => ipcRenderer.send('window-controls', 'close'),
    hideWindow: () => ipcRenderer.send('window-controls', 'hide'),
    resizeWindow: (deltaX, deltaY) => ipcRenderer.send('window-resize', { deltaX, deltaY })
});
