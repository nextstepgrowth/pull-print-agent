import fs from 'fs';
import path from 'path';
import os from 'os';
import { PrintJobLocalService } from '../src/services/print-job-local-service';

describe('PrintJobLocalService 유닛 테스트', () => {
  const testTempDir = path.join(os.tmpdir(), 'pull-print-agent-test-unit');

  beforeAll(() => {
    (PrintJobLocalService as any).TEMP_DIR = testTempDir;
    PrintJobLocalService.ensureTempDir();
  });

  afterEach(() => {
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

  it('PDF 파일 업로드 성공', () => {
    const req: any = {
      file: {
        originalname: 'test.pdf',
        path: path.join(testTempDir, 'tempfile.pdf')
      },
      params: { code: 'unitcode' }
    };
    fs.writeFileSync(req.file.path, '%PDF-1.4\n%...');
    const result = PrintJobLocalService.save(req);
    expect(result.code).toBe('unitcode');
    expect(fs.existsSync(path.join(testTempDir, 'unitcode', 'test.pdf'))).toBe(true);
  });

  it('PDF 외 파일 업로드 시 에러', () => {
    const req: any = {
      file: {
        originalname: 'test.txt',
        path: path.join(testTempDir, 'tempfile.txt')
      },
      params: { code: 'unitcode' }
    };
    fs.writeFileSync(req.file.path, 'not a pdf');
    expect(() => PrintJobLocalService.save(req)).toThrow(/PDF 파일만 허용/);
    // 파일이 삭제되었는지 확인
    expect(fs.existsSync(req.file.path)).toBe(false);
  });

  it('다운로드 시 zip 파일 반환', (done) => {
    // 업로드
    const uploadReq: any = {
      file: {
        originalname: 'test.pdf',
        path: path.join(testTempDir, 'tempfile2.pdf')
      },
      params: { code: 'unitcode' }
    };
    fs.writeFileSync(uploadReq.file.path, '%PDF-1.4\n%...');
    PrintJobLocalService.save(uploadReq);

    // 다운로드
    const downloadReq: any = { params: { code: 'unitcode' } };
    const res: any = {
      download: (filePath: string, cb: (err?: Error) => void) => {
        expect(fs.existsSync(filePath)).toBe(true);
        expect(path.extname(filePath)).toBe('.zip');
        cb();
        done();
      }
    };
    PrintJobLocalService.load(downloadReq, res);
  });

  it('없는 코드로 다운로드 시 에러', () => {
    const downloadReq: any = { params: { code: 'invalidcode' } };
    const res: any = {};
    expect(() => PrintJobLocalService.load(downloadReq, res)).toThrow(/유효하지 않은 인증번호/);
  });
}); 