# Logging Policy for Pull Print Agent

## 목적

본 문서는 Pull Print Agent 프로젝트에서 일관성 있고 협업 가능한 로그 정책을 정의합니다. 로그는 장애 대응, 운영 모니터링, 디버깅, 보안 감사 등 다양한 목적에 활용됩니다.

---

## 1. 로그 레벨

- **INFO**: 정상적인 서비스 흐름, 주요 이벤트(요청/응답, 파일 저장/다운로드 등)
- **WARN**: 예상 가능한 비정상 상황(잘못된 입력, 인증 실패, 파일 없음 등)
- **ERROR**: 예외 상황, 시스템 오류, 치명적 실패

---

## 2. 로그 포맷

- `[LEVEL] ISO8601타임스탬프 메시지 | 메타정보(JSON)`
- 예시:
  - `[INFO] 2025-07-12T00:52:00.123Z [UPLOAD] code=abcd, file=test.pdf, ip=1.2.3.4`
  - `[WARN] 2025-07-12T00:52:00.123Z [LOCAL_DOWNLOAD_FAIL] PDF 없음 code=abcd`
  - `[ERROR] 2025-07-12T00:52:00.123Z [UPLOAD_FATAL] code=abcd, err=ECONNRESET`

---

## 3. 로그 작성 방식

- 반드시 `src/log.ts`의 `logInfo`, `logWarn`, `logError` 유틸리티 함수만 사용
- 직접 `console.log/info/warn/error` 호출 금지 (ESLint 등으로 강제 가능)
- 로그 메시지는 한글 또는 영어로 명확하게 작성, context(코드, 파일명, ip 등) 포함 권장

---

## 4. 로그 위치

- 서버 진입점(`server.ts`): 요청/응답, 에러
- 서비스 레이어: 파일 저장/다운로드/삭제/만료 등 주요 이벤트 및 예외
- 컨트롤러: 환경 분기, 서비스 위임 등
- 프록시 서비스: 원격 업로드/다운로드, 실패 상황

---

## 5. 운영 환경 연동

- 현재는 console 기반 출력
- 추후 winston/pino 등 외부 로깅 시스템으로 확장 가능 (log.ts에서 일괄 적용)
- 로그 레벨/출력 위치는 환경변수 등으로 제어 가능하도록 설계

---

## 6. 협업 및 유지보수

- 로그 정책/유틸리티 변경 시 반드시 PR 리뷰 및 팀 공유
- 신규 기능/서비스 추가 시 로그 누락 여부 코드리뷰 체크
- 신규 팀원 온보딩 시 본 문서 및 log.ts 사용법 숙지 필수

---

## 7. 테스트 및 자동화

- log.ts 유틸리티에 대한 단위 테스트 필수 (예: tests/log.test.ts)
- 주요 서비스/컨트롤러 테스트에서 로그 호출 여부도 검증 가능
- ESLint custom rule로 직접 console 사용 금지 적용 권장

---

## 8. 참고 예시

```typescript
logInfo("[UPLOAD] code=abcd, file=test.pdf", { ip: req.ip });
logWarn("[LOCAL_DOWNLOAD_FAIL] PDF 없음 code=abcd");
logError("[UPLOAD_FATAL] code=abcd, err=" + err.message);
```

---

## 9. 변경 이력

- 2025-07-12: 최초 작성

---

문의 및 개선 제안은 언제든 PR 또는 이슈로 남겨주세요.
