import { logInfo, logWarn, logError } from '../src/utils/log';

describe('log util', () => {
  let infoSpy: jest.SpyInstance, warnSpy: jest.SpyInstance, errorSpy: jest.SpyInstance;

  beforeEach(() => {
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('logInfo는 INFO 로그를 출력한다', () => {
    logInfo('테스트 메시지', { foo: 1 });
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/\[INFO\].*테스트 메시지.*foo/));
  });

  it('logWarn는 WARN 로그를 출력한다', () => {
    logWarn('경고 메시지', { bar: 2 });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/\[WARN\].*경고 메시지.*bar/));
  });

  it('logError는 ERROR 로그를 출력한다', () => {
    logError('에러 메시지', { err: true });
    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/\[ERROR\].*에러 메시지.*err/));
  });
});
