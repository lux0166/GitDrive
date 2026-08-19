const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const DEFAULT_PORT = 4000;

function waitForServer(port, timeoutMs = 15000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          retry();
        }
      });

      req.on('error', () => {
        retry();
      });

      req.end();
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        return reject(new Error('Server startup timed out'));
      }
      setTimeout(check, 300);
    };

    check();
  });
}

function startBackendServer(port) {
  const fs = require('fs');
  const candidates = [
    path.join(__dirname, '../dist/server-bundle.cjs'),
    path.join(__dirname, '../server/dist/index.js'),
    path.join(process.resourcesPath, 'dist/server-bundle.cjs'),
    path.join(process.resourcesPath, 'server-bundle.cjs'),
    path.join(process.resourcesPath, 'app/dist/server-bundle.cjs'),
    path.join(process.resourcesPath, 'server/dist/index.js'),
  ];

  let serverScript = candidates[0];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      serverScript = c;
      break;
    }
  }

  console.log(`[GitDrive Desktop] Spawning server process from: ${serverScript}`);

  serverProcess = fork(serverScript, [], {
    env: {
      ...process.env,
      PORT: String(port),
      GITDRIVE_NO_AUTO_OPEN: '1', // Do not open external browser
    },
    silent: true,
  });

  serverProcess.stdout?.on('data', (data) => {
    console.log(`[GitDrive Server] ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[GitDrive Server Error] ${data.toString().trim()}`);
  });
}

async function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: '#09090b',
    title: 'GitDrive — Local-First Software Delivery Platform',
    autoHideMenuBar: true,
    show: false, // Show gracefully when content is ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Handle external link clicks securely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const appUrl = `http://localhost:${port}`;
  await mainWindow.loadURL(appUrl);
}

app.whenReady().then(async () => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;

  try {
    startBackendServer(port);
    await waitForServer(port);
    await createWindow(port);
  } catch (err) {
    console.error('Failed to initialize GitDrive Desktop App:', err);
    // Fallback: create window and load error message
    mainWindow = new BrowserWindow({ width: 800, height: 600, backgroundColor: '#09090b' });
    mainWindow.loadURL(`data:text/html,<html><body style="background:#09090b;color:#fff;font-family:sans-serif;padding:40px;"><h2>GitDrive Initialization Error</h2><p>${err.message}</p></body></html>`);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(port);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
