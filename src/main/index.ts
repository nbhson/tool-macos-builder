import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { IPC_CHANNELS } from '../shared/constants';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Create the main application window.
 * Uses contextIsolation + preload pattern instead of nodeIntegration for security.
 */
function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 752,
    minWidth: 800,
    minHeight: 600,
    title: 'Photopea',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false,
    },
  });

  win.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open external links in the default browser instead of a new Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  return win;
}

app.whenReady().then(() => {
  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => app.getVersion());

  createWindow();

  app.on('activate', () => {
    // Re-create window on macOS dock click if all windows are closed
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
