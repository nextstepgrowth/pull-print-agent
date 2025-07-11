import { BrowserWindow } from "electron";

export function printElectron(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({ show: false });
    win.loadURL(`file://${filePath}`);
    win.webContents.on("did-finish-load", () => {
      win.webContents.print(
        { silent: true, printBackground: true },
        (status, reason) => {
          win.close();
          status ? resolve() : reject(new Error(reason));
        },
      );
    });
  });
}
