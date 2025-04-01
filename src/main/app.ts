/**
 * アプリケーション全体の管理クラス
 */
import { ipcMain } from 'electron';
import { ConfigManager } from './config';
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

  constructor() {
    this.mascotWindow = new MascotWindow();
    this.configManager = new ConfigManager();
    
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
  }

  /**
   * IPC通信ハンドラーの設定
   */
  private setupIpcHandlers(): void {
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
  }

  /**
   * マスコットの表示
   */
  public showMascot(): void {
    this.mascotWindow.show();
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