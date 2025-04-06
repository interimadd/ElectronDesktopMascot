import { ipcMain, BrowserWindow } from 'electron';
import * as path from 'path';
import { MascotWindow } from './mascot-window';
import { logger } from '../../utils/logger';

export class BubbleWindow {
  private window: BrowserWindow | null = null;
  private mascotWindow: MascotWindow;

  constructor(mascotWindow: MascotWindow) {
    this.mascotWindow = mascotWindow;
    this.setupIpcHandlers();
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public createWindow(): void {
    if (this.window) {
      this.window.focus();
      return;
    }

    // マスコットウィンドウが存在しない場合は作成しない
    const mascotWindowInstance = this.mascotWindow.getWindow();
    if (!mascotWindowInstance) {
      logger.warn('Cannot create bubble window: Mascot window does not exist');
      return;
    }

    // マスコットウィンドウの位置を取得
    const mascotPosition = this.mascotWindow.getPosition();
    if (!mascotPosition) return;

    // バブルウィンドウを作成
    this.window = new BrowserWindow({
      width: 400,
      height: 600,
      x: mascotPosition.x - 75, // マスコットの中央上に配置
      y: mascotPosition.y - 320, // マスコットの上に配置
      transparent: true,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      show: false, // 初期状態では非表示
      icon: path.join(__dirname, '../../../src/styles/mascot/app_icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload.js')
      }
    });

    this.window.loadFile(path.join(__dirname, '../../../src/renderer/bubble.html'));

    // デバッグ用：開発ツールを開く
    // this.window.webContents.openDevTools({ mode: 'detach' });

    this.window.on('closed', () => {
      this.window = null;
    });

    // マスコットウィンドウが移動したときにバブルウィンドウも移動させる
    this.mascotWindow.onMove(() => {
      this.updatePosition();
    });
  }

  public show(): void {
    if (!this.window) {
      this.createWindow();
    }
    
    if (this.window) {
      // 表示前に位置を更新
      this.updatePosition();
      this.window.show();
    }
  }

  public hide(): void {
    if (this.window) {
      this.window.hide();
    }
  }

  public isVisible(): boolean {
    return this.window ? this.window.isVisible() : false;
  }

  public close(): void {
    if (this.window) {
      this.window.close();
      this.window = null;
    }
  }

  public toggle(): void {
    if (!this.window) {
      this.createWindow();
    }

    if (this.window) {
      if (this.isVisible()) {
        this.hide();
      } else {
        this.show();
        // チャットをクリア
        this.window.webContents.send('clear-chat');
      }
    }
  }

  public updatePosition(): void {
    if (!this.window) return;
    
    const mascotPosition = this.mascotWindow.getPosition();
    if (!mascotPosition) return;

    const bubbleSize = this.window.getSize();

    // バブルウィンドウの位置を更新（マスコットの上に配置）
    this.window.setPosition(
      mascotPosition.x - 75, // マスコットの中央上に配置
      mascotPosition.y - bubbleSize[1] + 10 // マスコットの上に配置（バブルの高さ + マージン）
    );
  }

  public resize(width: number, height: number): void {
    if (this.window) {
      this.window.setSize(width, height);
      // サイズ変更後に位置も更新
      this.updatePosition();
    }
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('toggle-chat-bubble', () => {
      try {
        this.toggle();
        return { success: true };
      } catch (error) {
        logger.error('Error toggling chat bubble:', error);
        return { error: 'Failed to toggle chat bubble' };
      }
    });

    ipcMain.handle('resize-bubble-window', (_event, width: number, height: number) => {
      try {
        this.resize(width, height);
        return { success: true };
      } catch (error) {
        logger.error('Error resizing bubble window:', error);
        return { error: 'Failed to resize bubble window' };
      }
    });
  }
}
