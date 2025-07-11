// print-service.ts
// 클라이언트·서버 양쪽에서 사용 가능한 PrintService 모듈 (TypeScript)

import fs from "fs";
import pathService from "path";
import fetch from "node-fetch";
import { BrowserWindow } from "electron";

const REMOTE_URL = process.env.PRINT_SERVER_URL;
const UPLOAD_ENDPOINT = REMOTE_URL ? `${REMOTE_URL}/upload` : "";
const DOWNLOAD_ENDPOINT = (code: string) =>
  REMOTE_URL ? `${REMOTE_URL}/download/${code}` : "";

const LOCAL_DIR = pathService.resolve(process.cwd(), "local_prints");
if (!REMOTE_URL && !fs.existsSync(LOCAL_DIR))
  fs.mkdirSync(LOCAL_DIR, { recursive: true });

export interface UploadResult {
  code: string;
  expiresIn: string;
}

export class PrintService {
  static async upload(
    filePath: string
  ): Promise<UploadResult | { localPath: string }> {
    if (REMOTE_URL) {
      const form = new FormData();
      // Change stream to blob
      form.append("file", filePath);
      const res = await fetch(UPLOAD_ENDPOINT, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      return res.json() as any;
    } else {
      const fileName = pathService.basename(filePath);
      const dest = pathService.join(LOCAL_DIR, fileName);
      fs.copyFileSync(filePath, dest);
      return { localPath: dest };
    }
  }

  static async print(identifier: string): Promise<void> {
    let filePath: string;
    if (REMOTE_URL) {
      const url = DOWNLOAD_ENDPOINT(identifier);
      const res = await fetch(url);
      if (res.status === 410) throw new Error("Code expired");
      if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
      const buffer = await res.buffer();
      const tempPath = pathService.join(process.cwd(), `${identifier}.pdf`);
      fs.writeFileSync(tempPath, buffer);
      filePath = tempPath;
    } else {
      filePath = pathService.join(LOCAL_DIR, identifier);
      if (!fs.existsSync(filePath)) throw new Error("File not found");
    }

    if (process.versions.electron) {
      await PrintService.electronPrint(filePath);
      return;
    }

    const { exec } = await import("child_process");
    exec(`lpr ${filePath}`, (err, _stdout, stderr) => {
      if (err) console.error("Print failed:", stderr);
    });
  }

  private static electronPrint(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const win = new BrowserWindow({ show: false });
      win.loadURL(`file://${filePath}`);
      win.webContents.on("did-finish-load", () => {
        win.webContents.print(
          { silent: true, printBackground: true },
          (status, reason) => {
            win.close();
            status ? resolve() : reject(new Error(reason));
          }
        );
      });
    });
  }
}
