/**
 * チャットバブルのレンダラープロセス
 */

/**
 * チャット機能を管理するクラス
 */
class BubbleController {
  // チャット関連のDOM要素
  private chatBubble: HTMLElement;
  private chatContent: HTMLElement;
  private chatInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;

  /**
   * コンストラクタ
   */
  constructor() {
    // DOMが読み込まれたら初期化
    document.addEventListener('DOMContentLoaded', this.onDOMContentLoaded.bind(this));
  }

  /**
   * DOM要素が読み込まれたときの処理
   */
  private onDOMContentLoaded(): void {
    // DOM要素の取得
    this.chatBubble = document.getElementById('chat-bubble') as HTMLElement;
    this.chatContent = document.getElementById('chat-content') as HTMLElement;
    this.chatInput = document.getElementById('chat-input') as HTMLInputElement;
    this.sendButton = document.getElementById('send-button') as HTMLButtonElement;

    // イベントリスナーの設定
    this.setupEventListeners();
    
    // 初期化
    this.init();
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // チャット送信ボタンのクリックイベント
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    // チャット入力のキーダウンイベント（Enterキーで送信）
    this.chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.sendMessage();
      }
    });

    // ウィンドウのリサイズイベント
    window.addEventListener('resize', () => {
      this.adjustHeight();
    });
  }

  /**
   * 初期化
   */
  private async init(): Promise<void> {
    try {
      // フォーカスを入力欄に設定
      this.chatInput.focus();
      
      // 高さを調整
      this.adjustHeight();
      
      // IPCイベントリスナーを設定
      // TypeScriptエラーを回避するために型アサーションを使用
      (window.electronAPI as any).onClearChat(() => {
        this.clearChat();
      });
    } catch (error) {
      console.error('Error initializing bubble:', error);
    }
  }

  /**
   * チャット内容をクリアする
   */
  private clearChat(): void {
    this.chatContent.innerHTML = '';
  }

  /**
   * メッセージを送信する
   */
  private async sendMessage(): Promise<void> {
    const message = this.chatInput.value.trim();
    
    if (!message) {
      return;
    }
    
    // ユーザーのメッセージを表示
    this.addMessage(message, 'user');
    
    // 入力欄をクリア
    this.chatInput.value = '';
    
    try {
      // メインプロセスにメッセージを送信
      // TypeScriptエラーを回避するために型アサーションを使用
      (window.electronAPI as any).sendMessageFromBubble(message);
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('メッセージの送信中にエラーが発生しました。', 'mascot');
    }
  }

  /**
   * チャット内容にメッセージを追加する
   * @param text メッセージテキスト
   * @param sender 送信者（'user' または 'mascot'）
   */
  private addMessage(text: string, sender: 'user' | 'mascot'): void {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(`message-${sender}`);
    messageElement.textContent = text;
    
    this.chatContent.appendChild(messageElement);
    
    // 自動スクロール
    this.chatContent.scrollTop = this.chatContent.scrollHeight;
  }

  /**
   * ウィンドウの高さを調整する
   */
  private adjustHeight(): void {
    const contentHeight = this.chatContent.scrollHeight;
    const inputHeight = this.chatInput.offsetHeight + 20; // 入力欄の高さ + マージン
    
    // 最大高さを設定（画面の70%まで）
    const maxHeight = Math.floor(window.innerHeight * 0.7);
    
    // 実際の高さを計算（コンテンツ + 入力欄、最大高さ以下）
    const actualHeight = Math.min(contentHeight + inputHeight + 40, maxHeight);
    
    // ウィンドウの高さを設定
    // TypeScriptエラーを回避するために型アサーションを使用
    (window.electronAPI as any).resizeBubbleWindow(350, actualHeight);
  }

  /**
   * マスコットからのメッセージを受信する
   * @param message メッセージテキスト
   */
  public receiveMessage(message: string): void {
    this.addMessage(message, 'mascot');
  }
}

// アプリケーション起動時にBubbleControllerのインスタンスを作成
const bubbleController = new BubbleController();

// グローバルに公開（IPCからアクセスできるようにする）
(window as any).bubbleController = bubbleController;