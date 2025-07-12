import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fork, ChildProcess } from 'child_process';

let serverProcess: ChildProcess | undefined;

function startServer() {
  let serverPath;
  if (process.env.NODE_ENV === 'production') {
    serverPath = path.resolve(__dirname, '..', 'server.js');
    console.log('[Electron] Starting production server:', serverPath);
    serverProcess = fork(serverPath, [], { stdio: 'inherit' });
  } else {
    serverPath = path.resolve(__dirname, '..', '..', 'src', 'server.ts');
    console.log('[Electron] Starting dev server with ts-node:', serverPath);
    serverProcess = fork(serverPath, [], {
      stdio: 'inherit',
      execArgv: ['-r', 'ts-node/register'],
    });
  }

  if (!serverProcess) {
    console.error('[Electron] Failed to start server process:', serverPath);
  }
}


// Import the compiled Express server when running packaged build.
// During development, we will nodemon/ts-node the server separately.
const DIST_ELECTRON = path.join(__dirname);
const DIST_RENDERER = path.join(__dirname, '../renderer');
const INDEX_HTML = path.join(DIST_RENDERER, 'index.html');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(INDEX_HTML);
  }
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
