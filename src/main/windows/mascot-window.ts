import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { logger } from '../../utils/logger';

export class MascotWindow {
  private window: BrowserWindow | null = null;

  constructor() {
    this.setupIpcHandlers();
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public createWindow(): void {
    this.window = new BrowserWindow({
      width: 200,
      height: 150,
      transparent: true,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      icon: path.join(__dirname, '../../../src/styles/mascot/app_icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload.js')
      }
    });

    this.window.loadFile(path.join(__dirname, '../../../src/renderer/mascot.html'));

    // デバッグ用：開発ツールを開く
    // this.window.webContents.openDevTools({ mode: 'detach' });

    this.window.on('closed', () => {
      this.window = null;
    });
  }

  public show(): void {
    if (this.window) {
      this.window.show();
    } else {
      this.createWindow();
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

  public setPosition(x: number, y: number): void {
    if (this.window) {
      this.window.setPosition(x, y);
      logger.debug(`Mascot window set to position: ${x},${y}`);
    }
  }

  public movePosition(moveX: number, moveY: number): void {
    if (this.window) {
      const [x, y] = this.window.getPosition();
      this.window.setPosition(x + moveX, y + moveY);
      logger.debug(`Mascot window moved by: ${moveX},${moveY} to position: ${x + moveX},${y + moveY}`);
    }
  }

  public getPosition(): { x: number, y: number } | null {
    if (!this.window) return null;
    const [x, y] = this.window.getPosition();
    return { x, y };
  }

  public setAlwaysOnTop(alwaysOnTop: boolean): void {
    if (this.window) {
      this.window.setAlwaysOnTop(alwaysOnTop);
    }
  }

  public isAlwaysOnTop(): boolean {
    return this.window ? this.window.isAlwaysOnTop() : false;
  }

  public onMove(callback: () => void): void {
    if (this.window) {
      this.window.on('move', callback);
    }
  }

  public setupIpcHandlers(): void {
    // ウィンドウを移動
    ipcMain.handle('move-window', (_event, moveX: number, moveY: number) => {
      try {
        this.movePosition(moveX, moveY);
        return { success: true };
      } catch (error) {
        logger.error('Error moving window:', error);
        return { error: 'Failed to move window' };
      }
    });

    // ウィンドウの現在位置を取得
    ipcMain.handle('get-window-position', () => {
      try {
        const position = this.getPosition();
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
        this.setPosition(x, y);
        return { success: true };
      } catch (error) {
        logger.error('Error setting window position:', error);
        return { error: 'Failed to set window position' };
      }
    });
  }
}
