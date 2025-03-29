/**
 * Logger のテスト
 */
import { Logger, LogLevel } from '../../src/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

// モック
jest.mock('fs');
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/tmp')
  }
}));

describe('Logger', () => {
  let logger: Logger;
  let mockAppendFileSync: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
    
    // fs.existsSync と fs.mkdirSync をモック
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    
    // fs.appendFileSync をスパイ
    mockAppendFileSync = jest.spyOn(fs, 'appendFileSync').mockImplementation(() => {});
    
    // console.log と console.error をスパイ
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Loggerのインスタンスを作成
    logger = new Logger('test.log', LogLevel.DEBUG);
  });

  afterEach(() => {
    // スパイを復元
    mockAppendFileSync.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  test('constructor should create log directory if it does not exist', () => {
    expect(fs.existsSync).toHaveBeenCalledWith(path.join('/tmp', 'logs'));
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.join('/tmp', 'logs'), { recursive: true });
  });

  test('constructor should not create log directory if it exists', () => {
    // fs.existsSync をモックして true を返すように設定
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    // 新しいインスタンスを作成
    new Logger('test.log');
    
    // fs.mkdirSync が呼ばれていないことを確認
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  test('debug should log debug message', () => {
    logger.debug('Debug message');
    
    // console.log が呼ばれたことを確認
    expect(mockConsoleLog).toHaveBeenCalled();
    
    // fs.appendFileSync が呼ばれたことを確認
    expect(mockAppendFileSync).toHaveBeenCalled();
    expect(mockAppendFileSync.mock.calls[0][1]).toContain('[DEBUG] Debug message');
  });

  test('info should log info message', () => {
    logger.info('Info message');
    
    // console.log が呼ばれたことを確認
    expect(mockConsoleLog).toHaveBeenCalled();
    
    // fs.appendFileSync が呼ばれたことを確認
    expect(mockAppendFileSync).toHaveBeenCalled();
    expect(mockAppendFileSync.mock.calls[0][1]).toContain('[INFO] Info message');
  });

  test('warn should log warning message', () => {
    logger.warn('Warning message');
    
    // console.log が呼ばれたことを確認
    expect(mockConsoleLog).toHaveBeenCalled();
    
    // fs.appendFileSync が呼ばれたことを確認
    expect(mockAppendFileSync).toHaveBeenCalled();
    expect(mockAppendFileSync.mock.calls[0][1]).toContain('[WARN] Warning message');
  });

  test('error should log error message', () => {
    logger.error('Error message');
    
    // console.log が呼ばれたことを確認
    expect(mockConsoleLog).toHaveBeenCalled();
    
    // fs.appendFileSync が呼ばれたことを確認
    expect(mockAppendFileSync).toHaveBeenCalled();
    expect(mockAppendFileSync.mock.calls[0][1]).toContain('[ERROR] Error message');
  });

  test('log should include additional data', () => {
    const data = { key: 'value' };
    logger.info('Info with data', data);
    
    // データが含まれていることを確認
    expect(mockAppendFileSync.mock.calls[0][1]).toContain('{"key":"value"}');
  });

  test('log should handle non-serializable data', () => {
    // 循環参照を持つオブジェクト
    const circular: any = {};
    circular.self = circular;
    
    logger.info('Info with circular data', circular);
    
    // エラーメッセージが含まれていることを確認
    expect(mockAppendFileSync.mock.calls[0][1]).toContain('[Error serializing data]');
  });

  test('log should respect log level', () => {
    // INFO レベルのロガーを作成
    const infoLogger = new Logger('info.log', LogLevel.INFO);
    
    // DEBUG メッセージを記録
    infoLogger.debug('Debug message');
    
    // DEBUG レベルのメッセージは記録されないことを確認
    expect(mockConsoleLog).not.toHaveBeenCalled();
    expect(mockAppendFileSync).not.toHaveBeenCalled();
    
    // INFO メッセージを記録
    infoLogger.info('Info message');
    
    // INFO レベルのメッセージは記録されることを確認
    expect(mockConsoleLog).toHaveBeenCalled();
    expect(mockAppendFileSync).toHaveBeenCalled();
  });

  test('log should handle error when writing to file', () => {
    // fs.appendFileSync がエラーをスローするようにモック
    mockAppendFileSync.mockImplementation(() => {
      throw new Error('Write error');
    });
    
    // エラーがキャッチされることを確認
    expect(() => {
      logger.info('Info message');
    }).not.toThrow();
    
    // console.error が呼ばれたことを確認
    expect(mockConsoleError).toHaveBeenCalled();
    expect(mockConsoleError.mock.calls[0][0]).toBe('Failed to write to log file:');
  });
});