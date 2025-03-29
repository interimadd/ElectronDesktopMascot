/**
 * システムトレイ管理クラス
 */
import { Tray, Menu, app } from 'electron';
import * as path from 'path';
import { App } from './app';

export class TrayManager {
  private tray: Tray | null = null;
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * システムトレイの初期化
   */
  public init(): void {
    // アプリケーションが終了するまでTrayオブジェクトを保持するために変数に代入
    this.tray = new Tray(path.join(__dirname, '../../assets/tray-icon.png'));
    this.tray.setToolTip('Electron Mascot');
    this.tray.setContextMenu(this.createContextMenu());
  }

  /**
   * コンテキストメニューの作成
   * @returns コンテキストメニュー
   */
  private createContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'マスコットを表示',
        click: () => {
          this.app.showMascot();
        }
      },
      {
        label: '設定',
        click: () => {
          this.app.createSettingsWindow();
        }
      },
      { type: 'separator' },
      {
        label: '終了',
        click: () => {
          app.quit();
        }
      }
    ]);
  }
}