// 공통 로그 유틸리티 (console 기반, 추후 winston/pino 등으로 확장 가능)
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

function format(level: LogLevel, msg: string, meta?: object) {
  const time = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${level}] ${time} ${msg}${metaStr}`;
}

export function logInfo(msg: string, meta?: object) {
  console.info(format('INFO', msg, meta));
}
export function logWarn(msg: string, meta?: object) {
  console.warn(format('WARN', msg, meta));
}
export function logError(msg: string, meta?: object) {
  console.error(format('ERROR', msg, meta));
}
