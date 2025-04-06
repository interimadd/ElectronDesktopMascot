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
    const position = await window.electronAPI.getWindowPosition();
    if (position.success) {
      this.initialWindowX = position.x;
      this.initialWindowY = position.y;
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
      
      // 除外する要素がある場合はここに追加
      
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
  private async handleDragEnd(): Promise<void> {
    if (this.isDragging) {
      this.isDragging = false;
      
      // ドラッグ終了時に現在の位置を取得して保存
      const position = await window.electronAPI.getWindowPosition();
      if (position.success) {
        // 設定に位置を保存
        await window.electronAPI.saveSettings({
          mascotPosition: { x: position.x, y: position.y }
        });
      }
    }
  }
}

class MascotController {
  // DOM要素
  private mascotElement: HTMLElement;
  private mascotImage: HTMLImageElement;
  private containerElement: HTMLElement;

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
      // チャットバブルウィンドウの表示/非表示を切り替え
      window.electronAPI.toggleChatBubble();
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
  }
}

// アプリケーション起動時にMascotControllerのインスタンスを作成
const mascotController = new MascotController();