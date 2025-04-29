import { BrowserWindow } from 'electron';
import * as path from 'path';
import { MascotWindow } from './mascot-window';

export class SettingsWindow {
  private window: BrowserWindow | null = null;
  private mascotWindow: MascotWindow;

  constructor(mascotWindow: MascotWindow) {
    this.mascotWindow = mascotWindow;
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public createWindow(): void {
    if (this.window) {
      this.window.focus();
      return;
    }

    // Temporarily disable alwaysOnTop for mascot window if exists
    const restoreAlwaysOnTop = this.mascotWindow.isAlwaysOnTop();
    this.mascotWindow.setAlwaysOnTop(false);

    this.window = new BrowserWindow({
      width: 500,
      height: 400,
      resizable: false,
      alwaysOnTop: true, // Always on top
      icon: path.join(__dirname, '../../../src/styles/mascot/app_icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../../preload.js')
      }
    });

    this.window.loadFile(path.join(__dirname, '../../../src/renderer/settings.html'));

    this.window.on('closed', () => {
      // Restore mascot window's alwaysOnTop when settings window closes
      if (restoreAlwaysOnTop) {
        this.mascotWindow.setAlwaysOnTop(true);
      }
      this.window = null;
    });
  }

  public show(): void {
    if (!this.window) {
      this.createWindow();
    } else {
      this.window.focus();
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
}
