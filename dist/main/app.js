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
exports.App = void 0;
/**
 * アプリケーション全体の管理クラス
 */
const electron_1 = require("electron");
const path = __importStar(require("path"));
const config_1 = require("./config");
const tray_1 = require("./tray");
const api_1 = require("../utils/api");
const logger_1 = require("../utils/logger");
class App {
    constructor() {
        this.mascotWindow = null;
        this.settingsWindow = null;
        this.configManager = new config_1.ConfigManager();
        this.trayManager = new tray_1.TrayManager(this);
    }
    /**
     * アプリケーションの初期化
     */
    init() {
        this.createMascotWindow();
        this.setupIpcHandlers();
        this.trayManager.init();
    }
    /**
     * マスコットウィンドウの作成
     */
    createMascotWindow() {
        this.mascotWindow = new electron_1.BrowserWindow({
            width: 300,
            height: 400,
            transparent: true,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, '../../src/preload.js')
            }
        });
        this.mascotWindow.loadFile(path.join(__dirname, '../../src/renderer/mascot.html'));
        // デバッグ用：開発ツールを開く
        // this.mascotWindow.webContents.openDevTools({ mode: 'detach' });
        this.mascotWindow.on('closed', () => {
            this.mascotWindow = null;
        });
    }
    /**
     * 設定ウィンドウの作成
     */
    createSettingsWindow() {
        if (this.settingsWindow) {
            this.settingsWindow.focus();
            return;
        }
        this.settingsWindow = new electron_1.BrowserWindow({
            width: 500,
            height: 400,
            resizable: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, '../../src/preload.js')
            }
        });
        this.settingsWindow.loadFile(path.join(__dirname, '../../src/renderer/settings.html'));
        this.settingsWindow.on('closed', () => {
            this.settingsWindow = null;
        });
    }
    /**
     * IPC通信ハンドラーの設定
     */
    setupIpcHandlers() {
        // ChatGPT APIにメッセージを送信
        electron_1.ipcMain.handle('send-message', async (_event, message) => {
            try {
                const apiKey = this.configManager.getApiKey();
                if (!apiKey) {
                    logger_1.logger.warn('API key is not set');
                    return { error: 'API key is not set. Please set it in the settings.' };
                }
                // ChatGPT APIの初期化
                api_1.chatGptApi.init(apiKey);
                // メッセージを送信
                logger_1.logger.info(`Sending message to ChatGPT: ${message}`);
                const response = await api_1.chatGptApi.sendMessage(message);
                logger_1.logger.info('Received response from ChatGPT');
                return { response };
            }
            catch (error) {
                logger_1.logger.error('Error sending message to ChatGPT:', error);
                return {
                    error: error instanceof Error ? error.message : 'Failed to send message to ChatGPT'
                };
            }
        });
        // 設定の保存
        electron_1.ipcMain.handle('save-settings', (_event, settings) => {
            try {
                this.configManager.saveSettings(settings);
                return { success: true };
            }
            catch (error) {
                console.error('Error saving settings:', error);
                return { error: 'Failed to save settings' };
            }
        });
        // 設定の取得
        electron_1.ipcMain.handle('get-settings', () => {
            try {
                return this.configManager.getSettings();
            }
            catch (error) {
                logger_1.logger.error('Error getting settings:', error);
                return { error: 'Failed to get settings' };
            }
        });
        // マスコットのドラッグ開始
        electron_1.ipcMain.on('mascot-drag-start', () => {
            if (this.mascotWindow) {
                this.mascotWindow.setIgnoreMouseEvents(false);
            }
        });
        // マスコットの位置を保存
        electron_1.ipcMain.handle('save-mascot-position', (_event, x, y) => {
            try {
                this.configManager.saveMascotPosition(x, y);
                logger_1.logger.info(`Saved mascot position: x=${x}, y=${y}`);
                return { success: true };
            }
            catch (error) {
                logger_1.logger.error('Error saving mascot position:', error);
                return { error: 'Failed to save mascot position' };
            }
        });
    }
    /**
     * マスコットの表示
     */
    showMascot() {
        if (this.mascotWindow) {
            this.mascotWindow.show();
        }
        else {
            this.createMascotWindow();
        }
    }
    /**
     * アプリケーションの終了
     */
    quit() {
        if (this.mascotWindow) {
            this.mascotWindow.close();
        }
        if (this.settingsWindow) {
            this.settingsWindow.close();
        }
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map