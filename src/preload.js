/**
 * プリロードスクリプト
 * レンダラープロセスとメインプロセス間の通信を可能にする
 */
const { contextBridge, ipcRenderer } = require('electron');

// レンダラープロセスで使用するAPIを定義
contextBridge.exposeInMainWorld('electronAPI', {
  // ChatGPT APIにメッセージを送信
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  
  // 設定を保存
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // 設定を取得
  getSettings: () => ipcRenderer.invoke('get-settings'),
  
  // ウィンドウのドラッグ
  startDrag: () => ipcRenderer.send('mascot-drag-start'),
  
  // ウィンドウの位置を保存
  saveMascotPosition: (x, y) => 
    ipcRenderer.invoke('save-mascot-position', x, y)
});