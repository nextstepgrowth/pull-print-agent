Print Queue Server & Client Library

간단한 PDF 프린트 작업 큐 서버와 클라이언트/CLI 라이브러리 설명서입니다.

📦 Prerequisites
• Node.js (>= 20)
• npm
• (선택) Electron 환경에서 자동 프린트 시 Electron 설치

🚀 설치

루트 디렉터리에서:


# 빌드

🛠️ 빌드

TypeScript 파일을 JavaScript로 컴파일:

npx tsc

생성된 결과는 dist/ 폴더에 저장됩니다.

🔧 실행 1. 서버 모드 (원격 업로드/다운로드 지원)

# 환경 변수 설정 (예시)

export PRINT_SERVER_URL="http://localhost:3000"

# 서버 시작

node dist/server.js

    2.	로컬 모드 (환경변수 미설정 시)

node dist/server.js

📋 CLI 사용

TypeScript 소스 그대로 실행하려면 ts-node를 이용:

# PDF 업로드 (remote 모드) 또는 로컬 저장

npx ts-node print-service.ts upload <path/to/file.pdf>

# 프린트 (인증코드 또는 파일명)

npx ts-node print-service.ts print <code_or_filename>

빌드 후 JavaScript 버전 실행:

# 업로드

node dist/print-service.js upload <path/to/file.pdf>

# 프린트

node dist/print-service.js print <code_or_filename>

📁 프로젝트 구조

├─ server.ts # Express 서버
├─ print-service.ts # 클라이언트·CLI 모듈
├─ install.sh # 의존성 설치 스크립트
├─ tsconfig.json # TypeScript 설정
└─ dist/ # 컴파일된 JS 결과

궁금한 점이 있으면 언제든 문의해 주세요!
