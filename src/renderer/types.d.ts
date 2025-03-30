/**
 * レンダラープロセスで使用するグローバル型定義
 */

interface Window {
  electronAPI: {
    sendMessage: (message: string) => Promise<any>;
    saveSettings: (settings: any) => Promise<any>;
    getSettings: () => Promise<any>;
    openSettings: () => Promise<any>;
    moveWindow: (moveX: number, moveY: number) => Promise<any>;
  };
}