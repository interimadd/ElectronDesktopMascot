"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Electronデスクトップマスコットアプリケーションのエントリーポイント
 */
const electron_1 = require("electron");
const app_1 = require("./main/app");
// アプリケーションのシングルインスタンスロックを確保
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    // 他のインスタンスが既に実行中の場合は終了
    electron_1.app.quit();
}
else {
    let mascotApp;
    // アプリケーションの準備完了時の処理
    electron_1.app.on('ready', () => {
        mascotApp = new app_1.App();
        mascotApp.init();
    });
    // 全てのウィンドウが閉じられたときの処理
    electron_1.app.on('window-all-closed', () => {
        // macOSでは、ユーザーがCmd + Qで明示的に終了するまでアプリケーションを終了しない
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    // アプリケーションがアクティブになったときの処理（macOS）
    electron_1.app.on('activate', () => {
        // macOSでは、ドックアイコンがクリックされたときにウィンドウが無い場合は新しいウィンドウを作成する
        if (mascotApp) {
            mascotApp.showMascot();
        }
    });
    // 2つ目のインスタンスが起動されたときの処理
    electron_1.app.on('second-instance', () => {
        // 既存のインスタンスのウィンドウをフォーカス
        if (mascotApp) {
            mascotApp.showMascot();
        }
    });
}
//# sourceMappingURL=index.js.map