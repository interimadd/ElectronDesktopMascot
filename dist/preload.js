"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * プリロードスクリプト
 * レンダラープロセスとメインプロセス間の通信を可能にする
 */
const electron_1 = require("electron");
// レンダラープロセスで使用するAPIを定義
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // ChatGPT APIにメッセージを送信
    sendMessage: (message) => electron_1.ipcRenderer.invoke('send-message', message),
    // 設定を保存
    saveSettings: (settings) => electron_1.ipcRenderer.invoke('save-settings', settings),
    // 設定を取得
    getSettings: () => electron_1.ipcRenderer.invoke('get-settings'),
    // ウィンドウのドラッグ
    startDrag: () => electron_1.ipcRenderer.send('mascot-drag-start'),
    // ウィンドウの位置を保存
    saveMascotPosition: (x, y) => electron_1.ipcRenderer.invoke('save-mascot-position', x, y)
});
//# sourceMappingURL=preload.js.map