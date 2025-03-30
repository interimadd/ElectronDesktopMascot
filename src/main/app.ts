/**
 * アプリケーション全体の管理クラス
 */
import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { ConfigManager } from './config';
import { TrayManager } from './tray';
import { chatGptApi } from '../utils/api';
import { logger } from '../utils/logger';

export class App {
  private mascotWindow: BrowserWindow | null = null;
  private settingsWindow: BrowserWindow | null = null;
  private configManager: ConfigManager;
  private trayManager: TrayManager;

  constructor() {
    this.configManager = new ConfigManager();
    this.trayManager = new TrayManager(this);
  }

  /**
   * アプリケーションの初期化
   */
  public init(): void {
    this.createMascotWindow();
    this.setupIpcHandlers();
    this.trayManager.init();
  }

  /**
   * マスコットウィンドウの作成
   */
  private createMascotWindow(): void {
    this.mascotWindow = new BrowserWindow({
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
        preload: path.join(__dirname, '../preload.js')
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
  public createSettingsWindow(): void {
    if (this.settingsWindow) {
      this.settingsWindow.focus();
      return;
    }

    this.settingsWindow = new BrowserWindow({
      width: 500,
      height: 400,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
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
  private setupIpcHandlers(): void {
    // ChatGPT APIにメッセージを送信
    ipcMain.handle('send-message', async (_event, message: string) => {
      try {
        const apiKey = this.configManager.getApiKey();
        if (!apiKey) {
          logger.warn('API key is not set');
          return { error: 'API key is not set. Please set it in the settings.' };
        }

        // ChatGPT APIの初期化
        chatGptApi.init(apiKey);
        
        // メッセージを送信
        logger.info(`Sending message to ChatGPT: ${message}`);
        const response = await chatGptApi.sendMessage(message);
        
        logger.info('Received response from ChatGPT');
        return { response };
      } catch (error) {
        logger.error('Error sending message to ChatGPT:', error);
        return {
          error: error instanceof Error ? error.message : 'Failed to send message to ChatGPT'
        };
      }
    });

    // 設定の保存
    ipcMain.handle('save-settings', (_event, settings: any) => {
      try {
        this.configManager.saveSettings(settings);
        return { success: true };
      } catch (error) {
        console.error('Error saving settings:', error);
        return { error: 'Failed to save settings' };
      }
    });

    // 設定の取得
    ipcMain.handle('get-settings', () => {
      try {
        return this.configManager.getSettings();
      } catch (error) {
        logger.error('Error getting settings:', error);
        return { error: 'Failed to get settings' };
      }
    });

    // マスコットのドラッグ開始
    ipcMain.on('mascot-drag-start', () => {
      if (this.mascotWindow) {
        this.mascotWindow.setIgnoreMouseEvents(false);
      }
    });

    // マスコットの位置を保存
    ipcMain.handle('save-mascot-position', (_event, x: number, y: number) => {
      try {
        this.configManager.saveMascotPosition(x, y);
        logger.info(`Saved mascot position: x=${x}, y=${y}`);
        return { success: true };
      } catch (error) {
        logger.error('Error saving mascot position:', error);
        return { error: 'Failed to save mascot position' };
      }
    });
    
    // 設定画面を開く
    ipcMain.handle('open-settings', () => {
      try {
        logger.info('Opening settings window');
        this.createSettingsWindow();
        return { success: true };
      } catch (error) {
        logger.error('Error opening settings window:', error);
        return { error: 'Failed to open settings window' };
      }
    });
  }

  /**
   * マスコットの表示
   */
  public showMascot(): void {
    if (this.mascotWindow) {
      this.mascotWindow.show();
    } else {
      this.createMascotWindow();
    }
  }

  /**
   * アプリケーションの終了
   */
  public quit(): void {
    if (this.mascotWindow) {
      this.mascotWindow.close();
    }
    if (this.settingsWindow) {
      this.settingsWindow.close();
    }
  }
}