/**
 * レンダラープロセスで使用するグローバル型定義
 */

interface Window {
  electronAPI: {
    sendMessage: (message: string) => Promise<any>;
    saveSettings: (settings: any) => Promise<any>;
    getSettings: () => Promise<any>;
    openSettings: () => Promise<any>;
    getWindowPosition: () => Promise<{ x: number; y: number; success: boolean; error?: string }>;
    setWindowPosition: (x: number, y: number) => Promise<{ success: boolean; error?: string }>;
    // チャットバブル用の新しいメソッド
    toggleChatBubble: () => Promise<{ success: boolean; error?: string }>;
    sendMessageFromBubble: (message: string) => Promise<{ success: boolean; error?: string }>;
    resizeBubbleWindow: (width: number, height: number) => Promise<{ success: boolean; error?: string }>;
    onClearChat: (callback: () => void) => void;
    receiveMascotMessage: (message: string) => Promise<{ success: boolean; error?: string }>;
  };
}