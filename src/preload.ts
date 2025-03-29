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
  
  // ウィンドウのドラッグ
  startDrag: () => ipcRenderer.send('mascot-drag-start'),
  
  // ウィンドウの位置を保存
  saveMascotPosition: (x: number, y: number) => 
    ipcRenderer.invoke('save-mascot-position', x, y)
});