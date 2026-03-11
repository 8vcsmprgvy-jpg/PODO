const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    closeWindow: () => ipcRenderer.send('window-controls', 'close'),
    hideWindow: () => ipcRenderer.send('window-controls', 'hide'),
    resizeWindow: (deltaX, deltaY) => ipcRenderer.send('window-resize', { deltaX, deltaY }),
    openSettings: () => ipcRenderer.send('open-settings'),
    updateTheme: (theme) => ipcRenderer.send('update-theme', theme),
    onThemeUpdate: (callback) => ipcRenderer.on('theme-updated', (_event, theme) => callback(theme))
});
