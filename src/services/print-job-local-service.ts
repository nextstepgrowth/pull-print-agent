// 로컬 파일 저장/다운로드/만료 삭제 서비스
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { Request, Response } from "express";
import { CustomError } from "../utils/custom-error";
import { TEMP_DIR_NAME } from "../config/const";
import os from "os";
import { logInfo, logWarn, logError } from "../utils/log";
export class PrintJobLocalService {
  static readonly TEMP_DIR = path.join(os.tmpdir(), TEMP_DIR_NAME);
  static ensureTempDir() {
    if (!fs.existsSync(this.TEMP_DIR)) fs.mkdirSync(this.TEMP_DIR, { recursive: true });
  }
  static save(req: Request) {
    const file = req.file;
    const code = req.params.code;
    if (!file) {
      logWarn(`[LOCAL_UPLOAD_FAIL] 파일 미첨부 code=${code}`);
      throw new CustomError("파일이 업로드되지 않았습니다.", 400);
    }
    if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
      fs.unlinkSync(file.path);
      logWarn(`[LOCAL_UPLOAD_FAIL] PDF 외 파일 업로드 code=${code}, file=${file.originalname}`);
      throw new CustomError("PDF 파일만 허용됩니다.", 400);
    }
    const codeDir = path.join(this.TEMP_DIR, code);
    if (!fs.existsSync(codeDir)) fs.mkdirSync(codeDir, { recursive: true });
    const destPath = path.join(codeDir, file.originalname);
    fs.renameSync(file.path, destPath);
    fs.utimesSync(codeDir, new Date(), new Date());
    logInfo(`[LOCAL_UPLOAD] code=${code}, file=${file.originalname}, dest=${destPath}`);
    return { code, expiresIn: "24h" };
  }
  static load(req: Request, res: Response) {
    const code = req.params.code;
    const codeDir = path.join(this.TEMP_DIR, code);
    if (!fs.existsSync(codeDir)) {
      logWarn(`[LOCAL_DOWNLOAD_FAIL] 유효하지 않은 인증번호 code=${code}`);
      throw new CustomError("유효하지 않은 인증번호입니다.", 404);
    }
    const files = fs.readdirSync(codeDir).filter(f => path.extname(f).toLowerCase() === ".pdf");
    if (files.length === 0) {
      logWarn(`[LOCAL_DOWNLOAD_FAIL] PDF 없음 code=${code}`);
      throw new CustomError("해당 코드에 대한 PDF 파일이 없습니다.", 404);
    }
    const archive = archiver("zip", { zlib: { level: 0 } });
    const tempZipPath = path.join(this.TEMP_DIR, `${code}.zip`);
    const output = fs.createWriteStream(tempZipPath);
    archive.pipe(output);
    for (const fileName of files) {
      archive.file(path.join(codeDir, fileName), { name: fileName });
    }
    archive.finalize();
    output.on("close", () => {
      logInfo(`[LOCAL_DOWNLOAD] code=${code}, files=${files.join(",")}, zip=${tempZipPath}`);
      res.download(tempZipPath, (err) => {
        if (err) {
          logError(`[LOCAL_DOWNLOAD_ZIP_FAIL] code=${code}, zip=${tempZipPath}, err=${err.message}`);
        }
        fs.unlink(tempZipPath, () => {});
      });
    });
    archive.on("error", (err) => {
      logError(`[LOCAL_DOWNLOAD_ZIP_ERROR] code=${code}, err=${err.message}`);
      throw new CustomError("압축 파일 생성 실패: " + err.message, 500);
    });
  }
  static deleteTimeoutFile() {
    const now = Date.now();
    if (!fs.existsSync(this.TEMP_DIR)) return;
    for (const codeDir of fs.readdirSync(this.TEMP_DIR)) {
      const fullPath = path.join(this.TEMP_DIR, codeDir);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && now - stat.mtimeMs > 24 * 60 * 60 * 1000) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      } catch {}
    }
  }
}
