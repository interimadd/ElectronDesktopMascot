/**
 * チャットバブルのレンダラープロセス
 */

/**
 * チャット機能を管理するクラス
 */
class BubbleController {
  // チャット関連のDOM要素
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
      (window.electronAPI as any).onClearChat(() => {
        this.clearChat();
      });

      // デバッグモードの場合、サンプルメッセージを表示
      const isDebugMode = await (window.electronAPI as any).isDebugMode();
      if (isDebugMode) {
        this.addSampleMessages();
      }
    } catch (error) {
      console.error('Error initializing bubble:', error);
    }
  }

  /**
   * デバッグ用のサンプルメッセージを追加する
   */
  private addSampleMessages(): void {
    // Sample message from the user
    this.addMessage('Hello!', 'user');
    
    // Sample message from the mascot
    this.addMessage('Hi there! How can I assist you today?', 'mascot');
    
    // Example of a longer message
    this.addMessage('Can you tell me how to use this app?', 'user');
    this.addMessage(
      `This app allows you to chat with a desktop mascot.<br><br>
      <strong>Features</strong>:<br>
      1. Click on the mascot to display the chat bubble.<br>
      2. Enter a message in the chat bubble, and the mascot will reply.<br>
      3. The mascot can be freely moved around.<br><br>
      <em>Enjoy!</em>`,
      'mascot'
    );
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
    
    const response = await (window.electronAPI as any).sendMessage(message);
  
    this.addMessage(response.response, 'mascot');
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
    
    // マスコットからのメッセージはHTML形式で表示し、ユーザーのメッセージはテキストとして表示
    if (sender === 'mascot') {
      // HTML形式で表示
      messageElement.innerHTML = text;
    } else {
      messageElement.textContent = text;
    }
    
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
    (window.electronAPI as any).resizeBubbleWindow(350, actualHeight);
  }
}

// アプリケーション起動時にBubbleControllerのインスタンスを作成
const bubbleController = new BubbleController();

// グローバルに公開（IPCからアクセスできるようにする）
(window as any).bubbleController = bubbleController;
