/**
 * Electronデスクトップマスコットアプリケーションのエントリーポイント
 */
import { app } from 'electron';
import { App } from './main/app';

// アプリケーションのシングルインスタンスロックを確保
const gotTheLock = app.requestSingleInstanceLock();

// GPUアクセラレーションを無効化
app.disableHardwareAcceleration();

if (!gotTheLock) {
  // 他のインスタンスが既に実行中の場合は終了
  app.quit();
} else {
  let mascotApp: App;

  // アプリケーションの準備完了時の処理
  app.on('ready', () => {
    mascotApp = new App();
    mascotApp.init();
  });

  // 全てのウィンドウが閉じられたときの処理
  app.on('window-all-closed', () => {
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