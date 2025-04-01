/**
 * マスコットのレンダラープロセス
 */

/**
 * ウィンドウのドラッグ移動を管理するクラス
 */
class WindowDragController {
  // ドラッグ関連の変数
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private initialWindowX = 0;
  private initialWindowY = 0;

  /**
   * コンストラクタ
   * @param element ドラッグ可能な要素
   * @param mascotElement マスコット要素（ドラッグ可能な領域）
   */
  constructor(
    private element: HTMLElement,
    private mascotElement: HTMLElement
  ) {
    this.setupEventListeners();
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // ドラッグ開始イベント
    this.element.addEventListener('mousedown', this.handleDragStart.bind(this));
    
    // ドラッグ中イベント
    document.addEventListener('mousemove', this.handleDragMove.bind(this));
    
    // ドラッグ終了イベント
    document.addEventListener('mouseup', this.handleDragEnd.bind(this));
  }

  /**
   * ドラッグ開始イベントの処理
   */
  private async handleDragStart(event: MouseEvent): Promise<void> {
    // 左クリックのみ処理（右クリックは無視）
    if (event.button !== 0) return;
    
    // クリックされた要素がマスコット要素またはその子要素かチェック
    const target = event.target as HTMLElement;
    if (!this.isMascotOrChild(target)) {
      return; // マスコット以外の要素がクリックされた場合は処理を中止
    }
    
    // ドラッグ開始位置を記録
    this.isDragging = true;
    this.dragStartX = event.screenX;
    this.dragStartY = event.screenY;
    
    // ウィンドウの初期位置を取得
    try {
      const position = await window.electronAPI.getWindowPosition();
      if (position.success) {
        this.initialWindowX = position.x;
        this.initialWindowY = position.y;
      }
    } catch (error) {
      console.error('Error getting window position:', error);
    }
  }

  /**
   * 要素がマスコット要素またはその子要素かどうかをチェック
   * @param element チェックする要素
   * @returns マスコット要素またはその子要素の場合はtrue
   */
  private isMascotOrChild(element: HTMLElement): boolean {
    // 要素がnullになるまで親をたどる
    let currentElement: HTMLElement | null = element;
    
    while (currentElement) {
      // 現在の要素がマスコット要素と一致するかチェック
      if (currentElement === this.mascotElement) {
        return true;
      }
      
      // チャットバブル要素かその子要素の場合は除外
      if (currentElement.id === 'chat-bubble' ||
          currentElement.closest('#chat-bubble')) {
        return false;
      }
      
      // 親要素に移動
      currentElement = currentElement.parentElement;
    }
    
    return false;
  }

  /**
   * ドラッグ中イベントの処理
   */
  private handleDragMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    // 新しい位置を計算: ウィンドウの初期位置 + (現在のマウス位置 - ドラッグ開始時のマウス位置)
    const newX = this.initialWindowX + (event.screenX - this.dragStartX);
    const newY = this.initialWindowY + (event.screenY - this.dragStartY);
    
    // IPCを使用してウィンドウを指定位置に移動
    window.electronAPI.setWindowPosition(newX, newY);
  }

  /**
   * ドラッグ終了イベントの処理
   */
  private handleDragEnd(): void {
    if (this.isDragging) {
      this.isDragging = false;
    }
  }
}

/**
 * チャット機能を管理するクラス
 */
class ChatController {
  // チャット関連のDOM要素
  private chatBubble: HTMLElement;
  private chatContent: HTMLElement;
  private chatInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;

  // 吹き出しの表示状態
  private isBubbleVisible = false;

  /**
   * コンストラクタ
   * @param elements チャット関連のDOM要素
   */
  constructor(elements: {
    chatBubble: HTMLElement;
    chatContent: HTMLElement;
    chatInput: HTMLInputElement;
    sendButton: HTMLButtonElement;
  }) {
    this.chatBubble = elements.chatBubble;
    this.chatContent = elements.chatContent;
    this.chatInput = elements.chatInput;
    this.sendButton = elements.sendButton;

    this.setupEventListeners();
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
  }

  /**
   * チャット吹き出しの表示/非表示を切り替える
   */
  public toggleChatBubble(): void {
    this.isBubbleVisible = !this.isBubbleVisible;
    
    if (this.isBubbleVisible) {
      this.chatBubble.classList.remove('hidden');
      this.chatInput.focus();
    } else {
      this.chatBubble.classList.add('hidden');
    }
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
      // ChatGPT APIにメッセージを送信
      const response = await window.electronAPI.sendMessage(message);
      
      if (response.error) {
        this.addMessage(`エラー: ${response.error}`, 'mascot');
      } else {
        this.addMessage(response.response, 'mascot');
      }
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
}

class MascotController {
  // DOM要素
  private mascotElement: HTMLElement;
  private mascotImage: HTMLImageElement;
  private containerElement: HTMLElement;

  // チャットとドラッグコントローラー
  private chatController: ChatController;
  private windowDragController: WindowDragController;

  // 画像切り替え用の変数
  private currentImageIndex: number = 1;
  private imageInterval: number | null = null;
  private readonly IMAGE_PATHS = [
    '../styles/mascot/bongo1.png',
    '../styles/mascot/bongo2.png'
  ];
  private readonly ANIMATION_INTERVAL = 200; // ミリ秒

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
    this.mascotElement = document.getElementById('mascot') as HTMLElement;
    this.mascotImage = document.getElementById('mascot-image') as HTMLImageElement;
    this.containerElement = document.querySelector('.container') as HTMLElement;

    // チャット関連の要素を取得
    const chatBubble = document.getElementById('chat-bubble') as HTMLElement;
    const chatContent = document.getElementById('chat-content') as HTMLElement;
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    const sendButton = document.getElementById('send-button') as HTMLButtonElement;

    // コントローラーの初期化
    this.chatController = new ChatController({
      chatBubble,
      chatContent,
      chatInput,
      sendButton
    });
    
    this.windowDragController = new WindowDragController(this.containerElement, this.mascotElement);

    // イベントリスナーの設定
    this.setupEventListeners();
    
    // 初期化
    this.init();
    
    // 画像アニメーションの開始
    this.startImageAnimation();
  }

  /**
   * イベントリスナーを設定する
   */
  private setupEventListeners(): void {
    // マスコットのクリックイベント
    this.mascotElement.addEventListener('click', () => {
      console.log('mascot clicked');
      this.chatController.toggleChatBubble();
    });

    // マスコットの右クリックイベント
    this.mascotElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      // 設定画面を開く
      window.electronAPI.openSettings();
    });
  }

  /**
   * 初期化
   */
  private async init(): Promise<void> {
    try {
      // 設定を取得
      const settings = await window.electronAPI.getSettings();
      
      // マスコットのサイズを設定
      if (settings.mascotSize) {
        this.mascotElement.style.transform = `scale(${settings.mascotSize})`;
      }
    } catch (error) {
      console.error('Error initializing mascot:', error);
    }
  }

  /**
   * 画像アニメーションを開始する
   */
  private startImageAnimation(): void {
    // すでに実行中の場合は停止
    if (this.imageInterval !== null) {
      clearInterval(this.imageInterval);
    }

    // 定期的に画像を切り替える
    this.imageInterval = window.setInterval(() => {
      this.switchImage();
    }, this.ANIMATION_INTERVAL);
  }

  /**
   * 画像を切り替える
   */
  private switchImage(): void {
    // 次の画像のインデックスを計算（0または1）
    this.currentImageIndex = (this.currentImageIndex + 1) % this.IMAGE_PATHS.length;
    
    // 画像のパスを設定
    this.mascotImage.src = this.IMAGE_PATHS[this.currentImageIndex];
    
    // デバッグ用
    console.log(`Image switched to: ${this.IMAGE_PATHS[this.currentImageIndex]}`);
    
    // デバッグステータス要素が存在する場合は更新
    const debugStatus = document.getElementById('debug-status');
    if (debugStatus) {
      const timestamp = new Date().toISOString().substr(11, 8);
      debugStatus.textContent = `[${timestamp}] Image switched to: ${this.IMAGE_PATHS[this.currentImageIndex]}`;
    }
  }
}

// アプリケーション起動時にMascotControllerのインスタンスを作成
const mascotController = new MascotController();