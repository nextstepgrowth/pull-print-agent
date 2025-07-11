// 기존 PrintJobController 관련 코드(http-service.ts)를 이 파일로 이동 예정
// PrintJobController: 업로드/다운로드 요청을 서비스로 위임
import { PrintJobLocalService } from "../services/print-job-local-service";
import { PrintJobProxyService } from "../services/print-job-proxy-service";
import { REMOTE_URL } from "../config/const";

export class PrintJobController {
  static async handlePost(req: any) {
    if (REMOTE_URL) {
      return PrintJobProxyService.upload(req);
    } else {
      return PrintJobLocalService.save(req);
    }
  }

  static async handleGet(req: any, res: any) {
    if (REMOTE_URL) {
      return PrintJobProxyService.download(req, res);
    } else {
      return PrintJobLocalService.load(req, res);
    }
  }
}
