import path from "path";
import fs from "fs";
import archiver from "archiver";
import { Request, Response } from "express";
import { CustomError } from "./custom-error";

interface Job {
  code: string;
  filePath: string;
  originalName: string;
  createdAt: number;
}

const jobs: Array<Job> = [];
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간

export class PrintJobService {
  static deleteTimeoutFile() {
    const now = Date.now();
    jobs.filter((job) => now - job.createdAt > EXPIRY_MS).forEach((job) => {
      fs.unlink(job.filePath, (err) => {
        if (err) {
          console.error(`파일 삭제 실패: ${job.filePath}`, err);
        }
      });
    });
  }

  static handleUpload(req: Request) {
    const file = req.file;
    const code = req.params.code;
    if (!file) {
      throw new CustomError("파일이 업로드되지 않았습니다.", 400);
    }
    if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
      fs.unlinkSync(file.path);
      throw new CustomError("PDF 파일만 허용됩니다.", 400);
    }
    jobs.push({
      code,
      filePath: file.path,
      originalName: file.originalname,
      createdAt: Date.now(),
    } as Job);
    return { code, expiresIn: "24h" };
  }

  static handleDownload(req: Request, res: Response) {
    const code = req.params.code;
    const selectedJobs = jobs.filter((job) => job.code === code);
    if (selectedJobs.length === 0) {
      throw new CustomError("유효하지 않은 인증번호입니다.", 404);
    }
    for (const job of selectedJobs) {
      const archive = archiver("zip", { zlib: { level: 0 } });
      const tempDir = path.join(__dirname, "temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      const tempFilePath = path.join(tempDir, `${job.originalName}.zip`);
      archive.pipe(fs.createWriteStream(tempFilePath));
      archive.file(job.filePath, { name: job.originalName });
      archive.finalize();
      res.download(tempFilePath, (err) => {
        if (err) {
          console.error("압축파일 전송 실패:", err);
        }
      });
    }
  }
} 