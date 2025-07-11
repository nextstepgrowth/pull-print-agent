import { app, BrowserWindow } from 'electron';
import path from 'node:path';

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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
