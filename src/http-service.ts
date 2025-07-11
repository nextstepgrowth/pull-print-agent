/*
  [파일 목표]
  이 파일은 PDF 프린트 작업 큐의 핵심 서비스 로직을 담당한다.
  - 업로드된 PDF 파일을 고유 코드와 함께 임시 폴더에 저장
  - 24시간 후 만료 및 자동 삭제
  - 코드로 파일을 조회해 다운로드(압축 포함) 가능
  - 모든 임시 파일 작업은 OS의 tmpdir 하위 pull-print-agent-temp 폴더에서만 수행
  - 폴더 생성은 프로그램 시작 시 1회만 수행하며, 각 작업 함수에서는 중복 생성하지 않음
*/

import fs from "fs";
import os from "os";
import path from "path";
import archiver from "archiver";
import { Request, Response } from "express";
import { CustomError } from "./custom-error";

const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

export class PrintJobService {
  static readonly TEMP_DIR = path.join(os.tmpdir(), "pull-print-agent-temp");

  /**
   * 프로그램 시작 시 1회만 호출하여 임시 폴더를 생성한다.
   * 이후 모든 임시 파일 작업은 이 폴더 하위에서만 수행한다.
   */
  static ensureTempDir() {
    if (!fs.existsSync(PrintJobService.TEMP_DIR)) {
      fs.mkdirSync(PrintJobService.TEMP_DIR, { recursive: true });
    }
  }

  // 클래스가 처음 로드될 때 임시 폴더를 자동으로 생성
  static {
    PrintJobService.ensureTempDir();
  }

  /**
   * 업로드된 PDF 파일을 code 폴더에 저장한다.
   * TEMP_DIR/code/ 폴더를 만들고, originalName으로 저장.
   * @throws CustomError 파일 미업로드, PDF 아님 등
   */
  static handleSave(req: Request) {
    const file = req.file;
    const code = req.params.code;
    if (!file) {
      throw new CustomError("파일이 업로드되지 않았습니다.", 400);
    }
    if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
      fs.unlinkSync(file.path);
      throw new CustomError("PDF 파일만 허용됩니다.", 400);
    }
    const codeDir = path.join(PrintJobService.TEMP_DIR, code);
    if (!fs.existsSync(codeDir)) {
      fs.mkdirSync(codeDir, { recursive: true });
    }
    const destPath = path.join(codeDir, file.originalname);
    fs.renameSync(file.path, destPath);
    // 업로드 시점 기록을 위해 codeDir의 mtime을 현재로 갱신
    fs.utimesSync(codeDir, new Date(), new Date());
    return { code, expiresIn: "24h" };
  }

  /**
   * code 폴더에서 PDF 파일을 찾아 zip으로 압축 후 다운로드한다.
   * @throws CustomError 코드 폴더 없음, PDF 없음, 압축 실패 등
   */
  static handleDownload(req: Request, res: Response) {
    const code = req.params.code;
    const codeDir = path.join(PrintJobService.TEMP_DIR, code);
    if (!fs.existsSync(codeDir)) {
      throw new CustomError("유효하지 않은 인증번호입니다.", 404);
    }
    const files = fs.readdirSync(codeDir).filter(f => path.extname(f).toLowerCase() === ".pdf");
    if (files.length === 0) {
      throw new CustomError("해당 코드에 대한 PDF 파일이 없습니다.", 404);
    }
    const archive = archiver("zip", { zlib: { level: 0 } });
    const tempZipPath = path.join(PrintJobService.TEMP_DIR, `${code}.zip`);
    const output = fs.createWriteStream(tempZipPath);
    archive.pipe(output);
    for (const fileName of files) {
      archive.file(path.join(codeDir, fileName), { name: fileName });
    }
    archive.finalize();
    output.on("close", () => {
      res.download(tempZipPath, (err) => {
        if (err) {
          console.error("압축파일 전송 실패:", err);
        }
        // 전송 후 zip 파일 삭제
        fs.unlink(tempZipPath, () => {});
      });
    });
    archive.on("error", (err) => {
      throw new CustomError("압축 파일 생성 실패: " + err.message, 500);
    });
  }

  /**
   * TEMP_DIR 하위의 code 폴더들을 순회하며, 24시간 초과 시 폴더 전체를 삭제한다.
   */
  static deleteTimeoutFile() {
    const now = Date.now();
    const codeDirs = fs.readdirSync(PrintJobService.TEMP_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(PrintJobService.TEMP_DIR, dirent.name));
    for (const codeDir of codeDirs) {
      let mtime = fs.statSync(codeDir).mtimeMs;
      // 폴더 내부 파일 중 가장 최근 mtime을 사용 (파일이 새로 업로드될 수 있으므로)
      const files = fs.readdirSync(codeDir);
      for (const file of files) {
        const filePath = path.join(codeDir, file);
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs > mtime) mtime = stat.mtimeMs;
      }
      if (now - mtime > EXPIRY_MS) {
        fs.rmSync(codeDir, { recursive: true, force: true });
      }
    }
  }
} 