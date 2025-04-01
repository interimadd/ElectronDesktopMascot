/**
 * Electronデスクトップマスコットアプリケーションのエントリーポイント
 */
import { app } from 'electron';
import { App } from './main/app';
import * as path from 'path';

// 開発モードの場合、electron-reloadを有効にする
if (process.env.NODE_ENV === 'development') {
  try {
    // srcディレクトリを監視対象とする
    const srcPath = path.join(__dirname, '..');
    require('electron-reload')(srcPath, {
      electron: path.join(srcPath, 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit',
      // 監視対象のファイル拡張子
      ignored: /node_modules|[\/\\]\.|\.json$/
    });
    console.log('Hot reload enabled');
  } catch (err) {
    console.error('electron-reload failed to initialize:', err);
  }
}

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