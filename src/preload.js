/**
 * プリロードスクリプト
 * レンダラープロセスとメインプロセス間の通信を可能にする
 */
const { contextBridge, ipcRenderer } = require('electron');

// デバッグ用のログ
console.log('Preload script is running');

// レンダラープロセスで使用するAPIを定義
contextBridge.exposeInMainWorld('electronAPI', {
  // ChatGPT APIにメッセージを送信
  sendMessage: (message) => {
    console.log('Sending message:', message);
    return ipcRenderer.invoke('send-message', message);
  },
  
  // 設定を保存
  saveSettings: (settings) => {
    console.log('Saving settings:', settings);
    return ipcRenderer.invoke('save-settings', settings);
  },
  
  // 設定を取得
  getSettings: () => {
    console.log('Getting settings');
    return ipcRenderer.invoke('get-settings');
  },
  
  // ウィンドウのドラッグ
  startDrag: () => {
    console.log('Starting drag');
    ipcRenderer.send('mascot-drag-start');
  },
  
  // ウィンドウの位置を保存
  saveMascotPosition: (x, y) => {
    console.log('Saving mascot position:', x, y);
    return ipcRenderer.invoke('save-mascot-position', x, y);
  },
  
  // 設定画面を開く
  openSettings: () => {
    console.log('Opening settings window');
    return ipcRenderer.invoke('open-settings');
  }
});

// グローバルオブジェクトに直接追加（デバッグ用）
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
});