import fs from 'fs';
import path from 'path';
import os from 'os';
import express from 'express';
import multer from 'multer';
import request from 'supertest';
import { PrintJobService } from '../src/print-job-service';

const testTempDir = path.join(os.tmpdir(), 'pull-print-agent-test');

describe('PrintJobService', () => {
  let app: express.Express;

  beforeAll(() => {
    // TEMP_DIR 오버라이드
    (PrintJobService as any).TEMP_DIR = testTempDir;
    PrintJobService.ensureTempDir();
    app = express();
    const upload = multer({ dest: testTempDir });

    app.post('/upload/:code', upload.single('file'), (req, res) => {
      try {
        const result = PrintJobService.handleUpload(req);
        res.status(200).json(result);
      } catch (e: any) {
        res.status(e.status || 500).json({ message: e.message });
      }
    });

    app.get('/download/:code', (req, res) => {
      try {
        PrintJobService.handleDownload(req, res);
      } catch (e: any) {
        res.status(e.status || 500).json({ message: e.message });
      }
    });
  });

  afterEach(() => {
    // 테스트 후 임시 폴더 정리
    if (fs.existsSync(testTempDir)) {
      fs.rmSync(testTempDir, { recursive: true, force: true });
      fs.mkdirSync(testTempDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testTempDir)) {
      fs.rmSync(testTempDir, { recursive: true, force: true });
    }
  });

  it('PDF 업로드 성공', async () => {
    const res = await request(app)
      .post('/upload/testcode')
      .attach('file', Buffer.from('%PDF-1.4\n%...'), 'test.pdf');
    expect(res.status).toBe(200);
    expect(res.body.code).toBe('testcode');
    // 실제 파일 존재 확인
    const filePath = path.join(testTempDir, 'testcode', 'test.pdf');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('PDF 외 파일 업로드 시 에러', async () => {
    const res = await request(app)
      .post('/upload/testcode')
      .attach('file', Buffer.from('not a pdf'), 'test.txt');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/PDF 파일만 허용/);
  });

  it('다운로드 시 zip 파일 반환', async () => {
    // 먼저 업로드
    await request(app)
      .post('/upload/testcode')
      .attach('file', Buffer.from('%PDF-1.4\n%...'), 'test.pdf');
    // 다운로드
    const res = await request(app)
      .get('/download/testcode');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toMatch(/zip/);
  });

  it('없는 코드로 다운로드 시 에러', async () => {
    const res = await request(app)
      .get('/download/invalidcode');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/유효하지 않은 인증번호/);
  });
}); 