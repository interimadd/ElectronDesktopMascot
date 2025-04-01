/**
 * アプリケーション全体の管理クラス
 */
import { ipcMain } from 'electron';
import { ConfigManager } from './config';
import { TrayManager } from './tray';
import { chatGptApi } from '../utils/api';
import { logger } from '../utils/logger';
import { MascotWindow } from './windows/mascot-window';
import { SettingsWindow } from './windows/settings-window';
import { BubbleWindow } from './windows/bubble-window';

export class App {
  private mascotWindow: MascotWindow;
  private settingsWindow: SettingsWindow;
  private bubbleWindow: BubbleWindow;
  private configManager: ConfigManager;
  private trayManager: TrayManager;

  constructor() {
    this.mascotWindow = new MascotWindow();
    this.configManager = new ConfigManager();
    this.trayManager = new TrayManager(this);
    
    // マスコットウィンドウのインスタンスを渡して初期化
    this.settingsWindow = new SettingsWindow(this.mascotWindow);
    this.bubbleWindow = new BubbleWindow(this.mascotWindow);
  }

  /**
   * アプリケーションの初期化
   */
  public init(): void {
    this.mascotWindow.createWindow();
    this.setupIpcHandlers();
    this.trayManager.init();
  }

  /**
   * IPC通信ハンドラーの設定
   */
  private setupIpcHandlers(): void {
    // チャットバブルの表示/非表示を切り替え
    ipcMain.handle('toggle-chat-bubble', () => {
      try {
        logger.info('Toggling chat bubble');
        this.bubbleWindow.toggle();
        return { success: true };
      } catch (error) {
        logger.error('Error toggling chat bubble:', error);
        return { error: 'Failed to toggle chat bubble' };
      }
    });

    // チャットバブルウィンドウのサイズを変更
    ipcMain.handle('resize-bubble-window', (_event, width: number, height: number) => {
      try {
        this.bubbleWindow.resize(width, height);
        return { success: true };
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
          
          this.bubbleWindow.receiveMessage("API key is not set. Please set it in the settings.");
          return { error: 'API key is not set. Please set it in the settings.' };
        }

        // ChatGPT APIの初期化
        chatGptApi.init(apiKey);
        
        // メッセージを送信
        logger.info(`Sending message to ChatGPT: ${message}`);
        const response = await chatGptApi.sendMessage(message);
        
        logger.info('Received response from ChatGPT');
        this.bubbleWindow.receiveMessage(response);
        
        return { success: true };
      } catch (error) {
        logger.error('Error sending message to ChatGPT:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message to ChatGPT';
        this.bubbleWindow.receiveMessage(`エラー: ${errorMessage}`);
        
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

        // チャットバブルウィンドウを表示
        if (!this.bubbleWindow.isVisible()) {
          this.bubbleWindow.show();
        }

        // バブルウィンドウにユーザーメッセージを表示
        this.bubbleWindow.addUserMessage(message);

        // ChatGPT APIの初期化
        chatGptApi.init(apiKey);
        
        // メッセージを送信
        logger.info(`Sending message to ChatGPT: ${message}`);
        const response = await chatGptApi.sendMessage(message);
        
        logger.info('Received response from ChatGPT');
        this.bubbleWindow.receiveMessage(response);
        
        return { response };
      } catch (error) {
        logger.error('Error sending message to ChatGPT:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message to ChatGPT';
        this.bubbleWindow.receiveMessage(`エラー: ${errorMessage}`);
        
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
        this.settingsWindow.show();
        return { success: true };
      } catch (error) {
        logger.error('Error opening settings window:', error);
        return { error: 'Failed to open settings window' };
      }
    });

    // ウィンドウを移動
    ipcMain.handle('move-window', (_event, moveX: number, moveY: number) => {
      try {
        this.mascotWindow.movePosition(moveX, moveY);
        return { success: true };
      } catch (error) {
        logger.error('Error moving window:', error);
        return { error: 'Failed to move window' };
      }
    });

    // ウィンドウの現在位置を取得
    ipcMain.handle('get-window-position', () => {
      try {
        const position = this.mascotWindow.getPosition();
        if (position) {
          logger.debug(`Window position: ${position.x},${position.y}`);
          return { ...position, success: true };
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
        this.mascotWindow.setPosition(x, y);
        return { success: true };
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
    this.mascotWindow.show();
  }

  /**
   * 設定ウィンドウの表示
   */
  public createSettingsWindow(): void {
    this.settingsWindow.show();
  }

  /**
   * アプリケーションの終了
   */
  public quit(): void {
    this.mascotWindow.close();
    this.settingsWindow.close();
    this.bubbleWindow.close();
  }
}