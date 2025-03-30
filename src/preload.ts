/**
 * プリロードスクリプト
 * レンダラープロセスとメインプロセス間の通信を可能にする
 */
import { contextBridge, ipcRenderer } from 'electron';

// レンダラープロセスで使用するAPIを定義
contextBridge.exposeInMainWorld('electronAPI', {
  // ChatGPT APIにメッセージを送信
  sendMessage: (message: string) => ipcRenderer.invoke('send-message', message),
  
  // 設定を保存
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  
  // 設定を取得
  getSettings: () => ipcRenderer.invoke('get-settings'),
  
  // 設定画面を開く
  openSettings: () => ipcRenderer.invoke('open-settings'),
  
  // ウィンドウを移動
  moveWindow: (moveX: number, moveY: number) => ipcRenderer.invoke('move-window', moveX, moveY),
  
  // ウィンドウの現在位置を取得
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  
  // ウィンドウを指定位置に移動
  setWindowPosition: (x: number, y: number) => ipcRenderer.invoke('set-window-position', x, y),
});