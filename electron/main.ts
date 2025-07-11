import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fork, ChildProcess } from 'child_process';

let serverProcess: ChildProcess | undefined;

function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // 개발 환경: ts-node로 TypeScript 서버 실행
    serverProcess = fork(
      path.join(__dirname, '../src/server.ts'),
      [],
      {
        stdio: 'inherit',
        execArgv: ['-r', 'ts-node/register'],
      }
    );
  } else {
    // 배포 환경: 빌드된 JS 서버 실행
    serverProcess = fork(
      path.join(__dirname, '../dist/server.js'),
      [],
      { stdio: 'inherit' }
    );
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
