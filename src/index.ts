/**
 * Electronデスクトップマスコットアプリケーションのエントリーポイント
 */
import { app } from 'electron';
import * as path from 'path';
import { App } from './main/app';

// アプリケーションのシングルインスタンスロックを確保
const gotTheLock = app.requestSingleInstanceLock();

// GPUアクセラレーションを無効化
app.disableHardwareAcceleration();

// スクロールバーを非表示にする
app.commandLine.appendSwitch('enable-features', 'OverlayScrollbar');

if (!gotTheLock) {
  // 他のインスタンスが既に実行中の場合は終了
  app.quit();
} else {
  let mascotApp: App;

  // アプリケーションの準備完了時の処理
  app.on('ready', () => {
    // macOSの場合はDockアイコンを設定
    if (process.platform === 'darwin') {
      app.dock.setIcon(path.join(__dirname, './styles/mascot/app_icon.png'));
    }
    
    mascotApp = new App();
    mascotApp.init();
  });

  // 全てのウィンドウが閉じられたときの処理
  app.on('window-all-closed', () => {
    // アプリケーションの終了処理を実行
    if (mascotApp) {
      mascotApp.quit();
    }
    
    // macOSでは、ユーザーがCmd + Qで明示的に終了するまでアプリケーションを終了しない
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // アプリケーションがアクティブになったときの処理（macOS）
  app.on('activate', () => {
    // macOSでは、ドックアイコンがクリックされたときにウィンドウが無い場合は新しいウィンドウを作成する
    if (mascotApp) {
      mascotApp.showMascot();
    }
  });

  // 2つ目のインスタンスが起動されたときの処理
  app.on('second-instance', () => {
    // 既存のインスタンスのウィンドウをフォーカス
    if (mascotApp) {
      mascotApp.showMascot();
    }
  });
}