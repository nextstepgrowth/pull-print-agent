import fs from "fs";
import path from "path";
import archiver from "archiver";
import { Request, Response } from "express";
import { CustomError } from "./custom-error";
import { TEMP_DIR_NAME } from "./const";
import os from "os";

export class PrintJobLocalService {
  static readonly TEMP_DIR = path.join(os.tmpdir(), TEMP_DIR_NAME);

  static ensureTempDir() {
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }
  }

  static {
    this.ensureTempDir();
  }

  /**
   * 업로드된 PDF 파일을 code 폴더에 저장한다.
   */
  static save(req: Request) {
    const file = req.file;
    const code = req.params.code;
    if (!file) {
      throw new CustomError("파일이 업로드되지 않았습니다.", 400);
    }
    if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
      fs.unlinkSync(file.path);
      throw new CustomError("PDF 파일만 허용됩니다.", 400);
    }
    const codeDir = path.join(this.TEMP_DIR, code);
    if (!fs.existsSync(codeDir)) {
      fs.mkdirSync(codeDir, { recursive: true });
    }
    const destPath = path.join(codeDir, file.originalname);
    fs.renameSync(file.path, destPath);
    fs.utimesSync(codeDir, new Date(), new Date());
    return { code, expiresIn: "24h" };
  }

  /**
   * code 폴더에서 PDF 파일을 찾아 zip으로 압축 후 다운로드한다.
   */
  static load(req: Request, res: Response) {
    const code = req.params.code;
    const codeDir = path.join(this.TEMP_DIR, code);
    if (!fs.existsSync(codeDir)) {
      throw new CustomError("유효하지 않은 인증번호입니다.", 404);
    }
    const files = fs.readdirSync(codeDir).filter(f => path.extname(f).toLowerCase() === ".pdf");
    if (files.length === 0) {
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
      res.download(tempZipPath, (err) => {
        if (err) {
          console.error("압축파일 전송 실패:", err);
        }
        fs.unlink(tempZipPath, () => {});
      });
    });
    archive.on("error", (err) => {
      throw new CustomError("압축 파일 생성 실패: " + err.message, 500);
    });
  }
}
