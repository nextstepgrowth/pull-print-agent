import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { PrintJobProxyService } from "../src/services/print-job-proxy-service";
import { CustomError } from "../src/utils/custom-error";
import { REMOTE_URL } from "../src/config/const";

jest.mock("axios");

const mockAxios = axios as jest.Mocked<typeof axios>;
const testFilePath = "/tmp/proxy-upload-test.pdf";

describe("PrintJobProxyService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.writeFileSync(testFilePath, "%PDF-1.4\n%...");
  });
  afterEach(() => {
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  });

  it("성공적으로 원격 업로드", async () => {
    mockAxios.post.mockResolvedValue({ data: { ok: true } });
    const req: any = {
      file: {
        originalname: "file.pdf",
        path: testFilePath,
      },
      params: { code: "proxytest" },
    };
    const result = await PrintJobProxyService.upload(req);
    expect(result.ok).toBe(true);
    expect(fs.existsSync(testFilePath)).toBe(false); // 파일 삭제됨
    expect(mockAxios.post).toHaveBeenCalled();
  });

  it("파일 미첨부시 예외", async () => {
    const req: any = { file: undefined, params: { code: "proxytest" } };
    await expect(PrintJobProxyService.upload(req)).rejects.toThrow(
      /업로드되지/,
    );
  });

  it("원격 업로드 실패시 파일 삭제 및 예외", async () => {
    mockAxios.post.mockRejectedValue(new Error("fail"));
    const req: any = {
      file: {
        originalname: "file.pdf",
        path: testFilePath,
      },
      params: { code: "proxytest" },
    };
    await expect(PrintJobProxyService.upload(req)).rejects.toThrow(/실패/);
    expect(fs.existsSync(testFilePath)).toBe(false); // 파일 삭제됨
  });

  it("원격 다운로드 성공 (스트림) - 헤더/pipe 호출", async () => {
    const mockStream: any = {
      pipe: jest.fn(),
      on: jest.fn((event, cb) => {
        if (event === "end") cb();
      }),
    };
    mockAxios.get.mockResolvedValue({
      headers: { foo: "bar" },
      data: mockStream,
    });
    const req: any = { params: { code: "proxytest" } };
    const res: any = {
      set: jest.fn(),
      end: jest.fn(),
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await PrintJobProxyService.download(req, res);
    expect(res.set).toHaveBeenCalledWith({ foo: "bar" });
    expect(mockStream.pipe).toHaveBeenCalledWith(res);
    expect(res.end).toHaveBeenCalled();
  });

  it("다운로드 스트림 에러시 502 응답", async () => {
    const mockStream: any = {
      pipe: jest.fn(),
      on: jest.fn(),
    };
    mockAxios.get.mockResolvedValue({ headers: {}, data: mockStream });
    const req: any = { params: { code: "proxytest" } };
    const res: any = {
      set: jest.fn(),
      end: jest.fn(),
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // 에러 핸들러 직접 호출
    await PrintJobProxyService.download(req, res);
    const errorHandler = mockStream.on.mock.calls.find(
      (call: [string, any]) => call[0] === "error",
    )[1];
    errorHandler(new Error("streamfail"));
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      error: expect.stringMatching(/streamfail/),
    });
  });
});
