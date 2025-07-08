const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the React app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for desktop-specific features
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('save-settings', (event, settings) => {
  store.set('settings', settings);
  return true;
});

ipcMain.handle('get-settings', () => {
  return store.get('settings');
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

// Voice recognition handlers
ipcMain.on('init-voice-recognition', (event, config) => {
  console.log('Voice recognition initialized with config:', config);
  // Initialize voice recognition with the provided config
  // This would integrate with actual voice recognition APIs
});

ipcMain.on('start-listening', (event) => {
  console.log('Starting voice recognition...');
  // Start voice recognition
  // For demo purposes, send a mock result after 2 seconds
  setTimeout(() => {
    event.reply('voice-result', 'Hello, this is a demo voice recognition result!');
  }, 2000);
});

ipcMain.on('stop-listening', (event) => {
  console.log('Stopping voice recognition...');
  // Stop voice recognition
}); 