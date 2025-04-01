/**
 * アプリケーション全体の管理クラス
 */
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import { ConfigManager } from './config';
import { TrayManager } from './tray';
import { chatGptApi } from '../utils/api';
import { logger } from '../utils/logger';

export class App {
  private mascotWindow: BrowserWindow | null = null;
  private settingsWindow: BrowserWindow | null = null;
  private bubbleWindow: BrowserWindow | null = null;
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
      width: 200,
      height: 150,
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

    // マスコットウィンドウが存在する場合、一時的にalwaysOnTopをfalseに設定
    const restoreAlwaysOnTop = this.mascotWindow?.isAlwaysOnTop() || false;
    if (this.mascotWindow) {
      this.mascotWindow.setAlwaysOnTop(false);
    }

    this.settingsWindow = new BrowserWindow({
      width: 500,
      height: 400,
      resizable: false,
      alwaysOnTop: true, // 常に最前面に表示
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      }
    });

    this.settingsWindow.loadFile(path.join(__dirname, '../../src/renderer/settings.html'));

    this.settingsWindow.on('closed', () => {
      // 設定ウィンドウが閉じられたら、マスコットウィンドウのalwaysOnTopを元に戻す
      if (this.mascotWindow && restoreAlwaysOnTop) {
        this.mascotWindow.setAlwaysOnTop(true);
      }
      this.settingsWindow = null;
    });
  }

  /**
   * チャットバブルウィンドウの作成
   */
  public createBubbleWindow(): void {
    if (this.bubbleWindow) {
      this.bubbleWindow.focus();
      return;
    }

    // マスコットウィンドウが存在しない場合は作成しない
    if (!this.mascotWindow) {
      logger.warn('Cannot create bubble window: Mascot window does not exist');
      return;
    }

    // マスコットウィンドウの位置を取得
    const [mascotX, mascotY] = this.mascotWindow.getPosition();
    const mascotSize = this.mascotWindow.getSize();

    // バブルウィンドウを作成
    this.bubbleWindow = new BrowserWindow({
      width: 400,
      height: 600,
      x: mascotX - 75, // マスコットの中央上に配置
      y: mascotY - 320, // マスコットの上に配置
      transparent: true,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      show: false, // 初期状態では非表示
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload.js')
      }
    });

    this.bubbleWindow.loadFile(path.join(__dirname, '../../src/renderer/bubble.html'));

    // デバッグ用：開発ツールを開く
    // this.bubbleWindow.webContents.openDevTools({ mode: 'detach' });

    this.bubbleWindow.on('closed', () => {
      this.bubbleWindow = null;
    });

    // マスコットウィンドウが移動したときにバブルウィンドウも移動させる
    this.mascotWindow.on('move', () => {
      this.updateBubblePosition();
    });
  }

  /**
   * チャットバブルウィンドウの位置を更新する
   */
  private updateBubblePosition(): void {
    if (!this.mascotWindow || !this.bubbleWindow) {
      return;
    }

    const [mascotX, mascotY] = this.mascotWindow.getPosition();
    const bubbleSize = this.bubbleWindow.getSize();

    // バブルウィンドウの位置を更新（マスコットの上に配置）
    this.bubbleWindow.setPosition(
      mascotX - 75, // マスコットの中央上に配置
      mascotY - bubbleSize[1] + 10 // マスコットの上に配置（バブルの高さ + マージン）
    );
  }

  /**
   * チャットバブルウィンドウの表示/非表示を切り替える
   */
  public toggleBubbleWindow(): void {
    if (!this.bubbleWindow) {
      this.createBubbleWindow();
    }

    if (this.bubbleWindow) {
      if (this.bubbleWindow.isVisible()) {
        this.bubbleWindow.hide();
      } else {
        // 表示前に位置を更新
        this.updateBubblePosition();
        this.bubbleWindow.show();
        // チャットをクリア
        this.bubbleWindow.webContents.send('clear-chat');
      }
    }
  }

  /**
   * IPC通信ハンドラーの設定
   */
  private setupIpcHandlers(): void {
    // チャットバブルの表示/非表示を切り替え
    ipcMain.handle('toggle-chat-bubble', () => {
      try {
        logger.info('Toggling chat bubble');
        this.toggleBubbleWindow();
        return { success: true };
      } catch (error) {
        logger.error('Error toggling chat bubble:', error);
        return { error: 'Failed to toggle chat bubble' };
      }
    });

    // チャットバブルウィンドウのサイズを変更
    ipcMain.handle('resize-bubble-window', (_event, width: number, height: number) => {
      try {
        if (this.bubbleWindow) {
          this.bubbleWindow.setSize(width, height);
          // サイズ変更後に位置も更新
          this.updateBubblePosition();
          return { success: true };
        }
        return { error: 'Bubble window not found' };
      } catch (error) {
        logger.error('Error resizing bubble window:', error);
        return { error: 'Failed to resize bubble window' };
      }
    });

    // チャットバブルからメッセージを送信
    ipcMain.handle('send-message-from-bubble', async (_event, message: string) => {
      try {
        const apiKey = this.configManager.getApiKey();
        if (!apiKey) {
          logger.warn('API key is not set');
          
          // バブルウィンドウにエラーメッセージを送信
          if (this.bubbleWindow) {
            this.bubbleWindow.webContents.executeJavaScript(
              `window.bubbleController.receiveMessage("API key is not set. Please set it in the settings.")`
            );
          }
          
          return { error: 'API key is not set. Please set it in the settings.' };
        }

        // ChatGPT APIの初期化
        chatGptApi.init(apiKey);
        
        // メッセージを送信
        logger.info(`Sending message to ChatGPT: ${message}`);
        const response = await chatGptApi.sendMessage(message);
        
        logger.info('Received response from ChatGPT');
        
        // バブルウィンドウにレスポンスを送信
        if (this.bubbleWindow) {
          this.bubbleWindow.webContents.executeJavaScript(
            `window.bubbleController.receiveMessage(${JSON.stringify(response)})`
          );
        }
        
        return { success: true };
      } catch (error) {
        logger.error('Error sending message to ChatGPT:', error);
        
        // バブルウィンドウにエラーメッセージを送信
        if (this.bubbleWindow) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message to ChatGPT';
          this.bubbleWindow.webContents.executeJavaScript(
            `window.bubbleController.receiveMessage("エラー: ${errorMessage}")`
          );
        }
        
        return { error: error instanceof Error ? error.message : 'Failed to send message to ChatGPT' };
      }
    });
    // ChatGPT APIにメッセージを送信（マスコットウィンドウから）
    ipcMain.handle('send-message', async (_event, message: string) => {
      try {
        const apiKey = this.configManager.getApiKey();
        if (!apiKey) {
          logger.warn('API key is not set');
          return { error: 'API key is not set. Please set it in the settings.' };
        }

        // チャットバブルウィンドウが存在しない場合は作成
        if (!this.bubbleWindow) {
          this.createBubbleWindow();
          this.bubbleWindow?.show();
        } else if (!this.bubbleWindow.isVisible()) {
          this.bubbleWindow.show();
        }

        // バブルウィンドウにユーザーメッセージを表示
        if (this.bubbleWindow) {
          this.bubbleWindow.webContents.executeJavaScript(
            `window.bubbleController.addMessage(${JSON.stringify(message)}, "user")`
          );
        }

        // ChatGPT APIの初期化
        chatGptApi.init(apiKey);
        
        // メッセージを送信
        logger.info(`Sending message to ChatGPT: ${message}`);
        const response = await chatGptApi.sendMessage(message);
        
        logger.info('Received response from ChatGPT');
        
        // バブルウィンドウにレスポンスを表示
        if (this.bubbleWindow) {
          this.bubbleWindow.webContents.executeJavaScript(
            `window.bubbleController.receiveMessage(${JSON.stringify(response)})`
          );
        }
        
        return { response };
      } catch (error) {
        logger.error('Error sending message to ChatGPT:', error);
        
        // バブルウィンドウにエラーメッセージを表示
        if (this.bubbleWindow) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message to ChatGPT';
          this.bubbleWindow.webContents.executeJavaScript(
            `window.bubbleController.receiveMessage("エラー: ${errorMessage}")`
          );
        }
        
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
        logger.error('Error saving settings:', error);
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

    // ウィンドウを移動
    ipcMain.handle('move-window', (_event, moveX: number, moveY: number) => {
      try {
        if (this.mascotWindow) {
          const [x, y] = this.mascotWindow.getPosition();
          this.mascotWindow.setPosition(x + moveX, y + moveY);
          logger.debug(`Window moved by: ${moveX},${moveY} to position: ${x + moveX},${y + moveY}`);
          return { success: true };
        }
        return { error: 'Mascot window not found' };
      } catch (error) {
        logger.error('Error moving window:', error);
        return { error: 'Failed to move window' };
      }
    });

    // ウィンドウの現在位置を取得
    ipcMain.handle('get-window-position', () => {
      try {
        if (this.mascotWindow) {
          const position = this.mascotWindow.getPosition();
          logger.debug(`Window position: ${position[0]},${position[1]}`);
          return { x: position[0], y: position[1], success: true };
        }
        return { error: 'Mascot window not found' };
      } catch (error) {
        logger.error('Error getting window position:', error);
        return { error: 'Failed to get window position' };
      }
    });

    // ウィンドウを指定位置に移動
    ipcMain.handle('set-window-position', (_event, x: number, y: number) => {
      try {
        if (this.mascotWindow) {
          this.mascotWindow.setPosition(x, y);
          logger.debug(`Window set to position: ${x},${y}`);
          return { success: true };
        }
        return { error: 'Mascot window not found' };
      } catch (error) {
        logger.error('Error setting window position:', error);
        return { error: 'Failed to set window position' };
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
    if (this.bubbleWindow) {
      this.bubbleWindow.close();
    }
  }
}