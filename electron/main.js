const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Chromium video parçası API'leri ve HEVC donanım çözümleme izni
app.commandLine.appendSwitch('enable-blink-features', 'AudioVideoTracks');
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    frame: false,
    backgroundColor: '#09090D',
    icon: path.join(__dirname, '../public/logo1.png'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Critical for cross-origin IPTV streams & m3u8 playlists
      allowRunningInsecureContent: true,
    },
  });

  // Custom User-Agent for IPTV servers
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'IPTVSmartersPro/3.1.5 (Linux; Android 11)';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // Window maximize/unmaximize notification to renderer
  mainWindow.on('maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('maximize-change', true);
    }
  });

  mainWindow.on('unmaximize', () => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('maximize-change', false);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const devUrl = 'http://localhost:5173';
  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  const distIndexPath = path.join(__dirname, '../dist/index.html');

  if (isDev) {
    let attempts = 0;
    const maxAttempts = 20;

    const tryLoad = () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      attempts++;
      mainWindow.loadURL(devUrl).catch(() => {
        if (attempts < maxAttempts) {
          setTimeout(tryLoad, 500);
        } else if (fs.existsSync(distIndexPath)) {
          mainWindow.loadFile(distIndexPath);
        }
      });
    };

    mainWindow.webContents.on('did-fail-load', (_event, _code, _desc, validatedURL) => {
      if (validatedURL && validatedURL.includes('5173')) {
        setTimeout(tryLoad, 500);
      }
    });

    tryLoad();
  } else {
    mainWindow.loadFile(distIndexPath);
  }
}

// IPC Handlers for Frameless Window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow && !mainWindow.isDestroyed() ? mainWindow.isMaximized() : false;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
