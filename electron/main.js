import { app, BrowserWindow, screen, ipcMain, Tray, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let tray = null;

// Force single instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
}

app.on('second-instance', () => {
    showWindow();
});

function showWindow() {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.focus();
}

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = 418;
    const windowHeight = 400;

    mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: width - windowWidth - 20,
        y: height - windowHeight - 20,
        frame: false,
        backgroundColor: '#1a1040',
        resizable: true,
        minWidth: 380,
        minHeight: 400,
        skipTaskbar: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    if (isDev) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
    } else {
        const htmlPath = path.join(__dirname, '../dist', 'index.html');
        console.log('Loading:', htmlPath);
        mainWindow.loadFile(htmlPath);
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    // Belt AND suspenders: show window multiple ways
    mainWindow.once('ready-to-show', () => {
        showWindow();
    });

    // Fallback in case ready-to-show never fires (transparent+frameless bug)
    setTimeout(() => {
        if (mainWindow && !mainWindow.isVisible()) {
            showWindow();
        }
    }, 1500);

    // On close, HIDE rather than destroy (so tray still works)
    mainWindow.on('close', (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            mainWindow.hide();
        }
    });
}

// IPC listeners for window controls
ipcMain.on('window-controls', (event, action) => {
    if (!mainWindow) return;
    if (action === 'close' || action === 'hide') {
        mainWindow.hide();
    }
});

ipcMain.on('window-resize', (event, { deltaX, deltaY }) => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();

    // Top-left resize: 
    // - New X = Old X + Delta X
    // - New Y = Old Y + Delta Y
    // - New Width = Old Width - Delta X
    // - New Height = Old Height - Delta Y

    let newWidth = bounds.width - deltaX;
    let newHeight = bounds.height - deltaY;
    let newX = bounds.x + deltaX;
    let newY = bounds.y + deltaY;

    // Constrain minimum size (matching the BrowserWindow options)
    const minWidth = 380;
    const minHeight = 400;

    if (newWidth < minWidth) {
        newX = bounds.x + (bounds.width - minWidth);
        newWidth = minWidth;
    }
    if (newHeight < minHeight) {
        newY = bounds.y + (bounds.height - minHeight);
        newHeight = minHeight;
    }

    mainWindow.setBounds({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newWidth),
        height: Math.round(newHeight)
    });
});

function createTray() {
    const iconPath = isDev
        ? path.join(__dirname, 'tray-icon.png')
        : path.join(process.resourcesPath, 'tray-icon.png');

    try {
        tray = new Tray(iconPath);
    } catch (error) {
        console.error('Failed to create tray icon:', error);
        return; // Don't crash if icon fails
    }

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show Timer', click: () => showWindow() },
        { type: 'separator' },
        {
            label: 'Quit', click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Pomodore Timer');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        if (mainWindow && mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            showWindow();
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    showWindow();
});

app.on('before-quit', () => {
    app.isQuitting = true;
});
