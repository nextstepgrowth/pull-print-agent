// Express + Electron 자동 프린트 서버 (TypeScript)
import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { PrintJobService } from "./http-service";
import { CustomError } from "./custom-error";

// Electron 타입 임포트 (런타임에만 존재)
declare global {
  interface Process {
    versions: {
      electron?: string;
      [key: string]: string | undefined;
    };
  }
}

interface Job {
  code: string;
  filePath: string;
  originalName: string;
  createdAt: number;
}

const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads/") });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// deleteTimeoutFile을 미들웨어로 등록
app.use((req, res, next) => {
  PrintJobService.deleteTimeoutFile();
  next();
});


// PDF 업로드
app.post("/:code", upload.single("file"), (req: Request, res: Response) => {
  try {
    const result = PrintJobService.handleSave(req);
    res.json(result);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.status).json({ error: err.message });
    } else {
      throw err;
    }
  }
});

// 다운로드 & Electron 자동 프린트
app.get("/:code", (req: Request, res: Response) => {
  try {
    PrintJobService.handleDownload(req, res);
  } catch (err: any) {
    if (err instanceof CustomError) {
      res.status(err.status).json({ error: err.message });
    } else {
      throw err;
    }
  }
});

app.listen(PORT, () => {
  console.log(`Print Queue Server listening on http://localhost:${PORT}`);
});
