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
import { Request, Response } from "express";
import { CustomError } from "./custom-error";
import { REMOTE_URL } from "./const";
import { PrintJobLocalService } from "./print-job-local-service";
import { PrintJobProxyService } from "./print-job-proxy-service";

export class PrintJobController {
  /**
   * 업로드/저장 분기 컨트롤러
   */
  static async handlePost(req: Request) {
    if (REMOTE_URL) {
      return await PrintJobProxyService.upload(req);
    } else {
      return PrintJobLocalService.save(req);
    }
  }

  /**
   * 다운로드/프록시 분기 컨트롤러
   */
  static async handleGet(req: Request, res: Response) {
    if (REMOTE_URL) {
      return await PrintJobProxyService.download(req, res);
    } else {
      return PrintJobLocalService.load(req, res);
    }
  }
}