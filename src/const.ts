// 프로젝트 공통 상수 모음

export const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간
export const TEMP_DIR_NAME = "pull-print-agent-temp";

// 파일 저장 대신 프록시/클라이언트 모드로 동작 시 사용할 원격 서버 URL (환경변수에서 가져옴)
export const REMOTE_URL = process.env.PULL_PRINT_AGENT_REMOTE_URL;
