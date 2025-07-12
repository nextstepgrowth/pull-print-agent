// Express + Electron 자동 프린트 서버 (TypeScript)
const express = require("express");
const multer = require("multer");
const path = require("path");
import type { Request, Response, NextFunction } from "express";
import { PrintJobController } from "./controllers/print-job-controller";
import { PrintJobLocalService } from "./services/print-job-local-service";
import { logInfo, logWarn, logError } from "./utils/log";
import { CustomError } from "./utils/custom-error";

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
app.use((req: Request, res: Response, next: NextFunction) => {
  PrintJobLocalService.deleteTimeoutFile();
  logInfo(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// PDF 업로드
app.post(
  "/print-jobs/:code",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const result = await PrintJobController.handlePost(req);
      logInfo(
        `[UPLOAD] code=${(req as any).params.code}, file=${(req as any).file?.originalname}, ip=${(req as any).ip}`,
      );
      res.json(result);
    } catch (err: any) {
      if (err instanceof CustomError) {
        logWarn(
          `[UPLOAD_FAIL] code=${(req as any).params.code}, file=${(req as any).file?.originalname}, status=${err.status}, msg=${err.message}`,
        );
        res.status(Number((err as any).status)).json({ error: err.message });
      } else {
        throw err;
      }
    }
  },
);

// 다운로드 & Electron 자동 프린트
app.get("/print-jobs/:code", async (req: Request, res: Response) => {
  try {
    await PrintJobController.handleGet(req, res);
  } catch (err: any) {
    if (err instanceof CustomError) {
      logWarn(
        `[DOWNLOAD_FAIL] code=${(req as any).params.code}, status=${err.status}, msg=${err.message}`,
      );
      res.status(Number((err as any).status)).json({ error: err.message });
    } else {
      throw err;
    }
  }
});

app.listen(PORT, () => {
  logInfo(`Print Queue Server listening on http://localhost:${PORT}`);
});
