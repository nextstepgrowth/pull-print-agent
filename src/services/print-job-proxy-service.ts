import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { Request, Response } from "express";
import { REMOTE_URL } from "../config/const";
import { CustomError } from "../utils/custom-error";

export class PrintJobProxyService {
  static async upload(req: Request) {
    const file = req.file;
    const code = req.params.code;
    if (!file) {
      throw new CustomError("파일이 업로드되지 않았습니다.", 400);
    }
    const form = new FormData();
    form.append("file", fs.createReadStream(file.path), file.originalname);
    form.append("code", code);
    let response;
    try {
      response = await axios.post(`${REMOTE_URL}/${code}`, form, {
        headers: form.getHeaders(),
      });
      return response.data;
    } catch (err: any) {
      throw new CustomError(
        "원격 서버 업로드 실패: " + (err.response?.data?.error || err.message),
        502,
      );
    } finally {
      if (file && file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }
    }
  }

  static async download(req: Request, res: Response) {
    const code = req.params.code;
    const response = await axios.get(`${REMOTE_URL}/${code}`, {
      responseType: "stream",
    });
    res.set(response.headers);
    response.data.pipe(res);
    response.data.on("end", () => res.end());
    response.data.on("error", (err: any) => {
      if (!res.headersSent) {
        res
          .status(502)
          .json({ error: "원격 서버 다운로드 실패: " + err.message });
      }
    });
  }
}
