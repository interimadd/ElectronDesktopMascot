/**
 * ロギングユーティリティ
 */
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

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
  private logFilePath: string;
  private logLevel: LogLevel;

  /**
   * コンストラクタ
   * @param filename ログファイル名
   * @param level ログレベル
   */
  constructor(filename: string = 'app.log', level: LogLevel = LogLevel.INFO) {
    // ログファイルのパスを設定
    const userDataPath = app.getPath('userData');
    const logDir = path.join(userDataPath, 'logs');
    
    // ログディレクトリが存在しない場合は作成
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    this.logFilePath = path.join(logDir, filename);
    this.logLevel = level;
    
    this.info(`Logger initialized. Log file: ${this.logFilePath}`);
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
    
    // ファイルに書き込み
    try {
      fs.appendFileSync(this.logFilePath, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
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

// シングルトンインスタンスをエクスポート
export const logger = new Logger();