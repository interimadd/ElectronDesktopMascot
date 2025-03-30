/**
 * ロギングユーティリティ
 */
/**
 * ログレベル
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * ロガークラス
 */
export class Logger {
  private logLevel: LogLevel;

  /**
   * コンストラクタ
   * @param level ログレベル
   */
  constructor(level: LogLevel = LogLevel.INFO) {
    this.logLevel = level;
    this.info('Logger initialized.');
  }

  /**
   * ログを記録する
   * @param level ログレベル
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  private log(level: LogLevel, message: string, data?: any): void {
    // 設定されたログレベルより低いレベルのログは記録しない
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    if (levels.indexOf(level) < levels.indexOf(this.logLevel)) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      try {
        const dataString = typeof data === 'object' ? JSON.stringify(data) : data.toString();
        logMessage += ` - ${dataString}`;
      } catch (error) {
        logMessage += ' - [Error serializing data]';
      }
    }
    
    // コンソールに出力
    console.log(logMessage);
  }

  /**
   * デバッグログを記録する
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * 情報ログを記録する
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * 警告ログを記録する
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * エラーログを記録する
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }
}

// 環境変数LOG_LEVELに基づいてログレベルを設定
const logLevelFromEnv = process.env.LOG_LEVEL as LogLevel;
const logLevel = Object.values(LogLevel).includes(logLevelFromEnv) ? logLevelFromEnv : LogLevel.INFO;

export const logger = new Logger(logLevel);