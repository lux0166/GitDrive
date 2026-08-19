const { app, BrowserWindow, shell, utilityProcess } = require('electron');
const path = require('path');
const http = require('http');
const net = require('net');
const fs = require('fs');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const DEFAULT_PORT = 4000;

// 1. Single Instance Lock for Windows
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// 2. Dynamic Port Resolution for Windows EADDRINUSE resilience
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(startPort = 4000) {
  for (let port = startPort; port < startPort + 50; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return startPort;
}

// 3. Health check poller
function waitForServer(port, timeoutMs = 20000) {
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
      setTimeout(check, 250);
    };

    check();
  });
}

// 4. Background Server Process Spawner with AppData storage support
function startBackendServer(port) {
  const candidates = [
    path.join(__dirname, '../dist/server-bundle.cjs'),
    path.join(__dirname, '../server/dist/index.js'),
    path.join(process.resourcesPath, 'dist', 'server-bundle.cjs'),
    path.join(process.resourcesPath, 'server-bundle.cjs'),
    path.join(process.resourcesPath, 'app', 'dist', 'server-bundle.cjs'),
    path.join(process.resourcesPath, 'server', 'dist', 'index.js'),
  ];

  let serverScript = candidates[0];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      serverScript = c;
      break;
    }
  }

  const userDataPath = app.getPath('userData');
  const gitDriveDataDir = path.join(userDataPath, 'data');
  try {
    if (!fs.existsSync(gitDriveDataDir)) {
      fs.mkdirSync(gitDriveDataDir, { recursive: true });
    }
  } catch (e) {
    console.warn('[GitDrive Desktop] Failed to create AppData directory, using fallback:', e);
  }

  console.log(`[GitDrive Desktop] Spawning server process from: ${serverScript}`);
  console.log(`[GitDrive Desktop] AppData Directory: ${gitDriveDataDir}`);

  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    PORT: String(port),
    GITDRIVE_DATA_DIR: gitDriveDataDir,
    GITDRIVE_NO_AUTO_OPEN: '1', // Do not open external browser
  };

  if (utilityProcess && typeof utilityProcess.fork === 'function') {
    serverProcess = utilityProcess.fork(serverScript, [], {
      env,
      stdio: 'pipe',
    });

    serverProcess.stdout?.on('data', (data) => {
      console.log(`[GitDrive Server] ${data.toString().trim()}`);
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[GitDrive Server Error] ${data.toString().trim()}`);
    });
  } else {
    serverProcess = fork(serverScript, [], {
      env,
      silent: true,
    });

    serverProcess.stdout?.on('data', (data) => {
      console.log(`[GitDrive Server] ${data.toString().trim()}`);
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[GitDrive Server Error] ${data.toString().trim()}`);
    });
  }
}

function terminateServer() {
  if (serverProcess) {
    try {
      if (typeof serverProcess.kill === 'function') {
        serverProcess.kill();
      }
    } catch {}
    serverProcess = null;
  }
}

// 5. Native Windows Desktop Window
async function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: '#09090b',
    title: 'GitDrive — Local-First Software Delivery Platform',
    autoHideMenuBar: true,
    show: false, // Show gracefully when ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Intercept external links safely
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

// 6. App Lifecycle Hooks
app.whenReady().then(async () => {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    startBackendServer(port);
    await waitForServer(port);
    await createWindow(port);
  } catch (err) {
    console.error('Failed to initialize GitDrive Desktop App:', err);
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      backgroundColor: '#09090b',
      title: 'GitDrive — Startup Error',
    });
    mainWindow.loadURL(`data:text/html,<html><body style="background:#09090b;color:#fff;font-family:sans-serif;padding:40px;"><h2>GitDrive Initialization Error</h2><p style="color:#ef4444">${err.message}</p></body></html>`);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(DEFAULT_PORT);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    terminateServer();
    app.quit();
  }
});

app.on('before-quit', () => {
  terminateServer();
});
