"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
/**
 * ロギングユーティリティ
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
/**
 * ログレベル
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * ロガークラス
 */
class Logger {
    /**
     * コンストラクタ
     * @param filename ログファイル名
     * @param level ログレベル
     */
    constructor(filename = 'app.log', level = LogLevel.INFO) {
        // ログファイルのパスを設定
        const userDataPath = electron_1.app.getPath('userData');
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
    log(level, message, data) {
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
            }
            catch (error) {
                logMessage += ' - [Error serializing data]';
            }
        }
        // コンソールに出力
        console.log(logMessage);
        // ファイルに書き込み
        try {
            fs.appendFileSync(this.logFilePath, logMessage + '\n');
        }
        catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
    /**
     * デバッグログを記録する
     * @param message ログメッセージ
     * @param data 追加データ（オプション）
     */
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    /**
     * 情報ログを記録する
     * @param message ログメッセージ
     * @param data 追加データ（オプション）
     */
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    /**
     * 警告ログを記録する
     * @param message ログメッセージ
     * @param data 追加データ（オプション）
     */
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    /**
     * エラーログを記録する
     * @param message ログメッセージ
     * @param data 追加データ（オプション）
     */
    error(message, data) {
        this.log(LogLevel.ERROR, message, data);
    }
}
exports.Logger = Logger;
// シングルトンインスタンスをエクスポート
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map