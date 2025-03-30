/**
 * マスコットのレンダラープロセス
 */

// DOM要素（DOMContentLoadedイベントで初期化）
let mascotElement: HTMLElement;
let chatBubble: HTMLElement;
let chatContent: HTMLElement;
let chatInput: HTMLInputElement;
let sendButton: HTMLButtonElement;
let containerElement: HTMLElement;

// 吹き出しの表示状態
let isBubbleVisible = false;

// ドラッグ関連の変数
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let initialWindowX = 0;
let initialWindowY = 0;

/**
 * デバッグ用のステータス表示
 * @param message 表示するメッセージ
 */
function updateDebugStatus(message: string): void {
  const debugStatus = document.getElementById('debug-status');
  if (debugStatus) {
    const timestamp = new Date().toISOString().substr(11, 8);
    debugStatus.textContent = `[${timestamp}] ${message}`;
  }
}

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', () => {
  // DOM要素の取得
  mascotElement = document.getElementById('mascot') as HTMLElement;
  chatBubble = document.getElementById('chat-bubble') as HTMLElement;
  chatContent = document.getElementById('chat-content') as HTMLElement;
  chatInput = document.getElementById('chat-input') as HTMLInputElement;
  sendButton = document.getElementById('send-button') as HTMLButtonElement;
  containerElement = document.querySelector('.container') as HTMLElement;

  // マスコットのクリックイベント
  mascotElement.addEventListener('click', () => {
    console.log('mascot clicked');
    toggleChatBubble();
  });

  // マスコットの右クリックイベント
  mascotElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    // 設定画面を開く
    window.electronAPI.openSettings();
  });

  // チャット送信ボタンのクリックイベント
  sendButton.addEventListener('click', () => {
    sendMessage();
  });

  // チャット入力のキーダウンイベント（Enterキーで送信）
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  // ドラッグ開始イベント
  containerElement.addEventListener('mousedown', async (event) => {
    // 左クリックのみ処理（右クリックは無視）
    if (event.button !== 0) return;
    
    // ドラッグ開始位置を記録
    isDragging = true;
    dragStartX = event.screenX;
    dragStartY = event.screenY;
    
    // ウィンドウの初期位置を取得
    try {
      const position = await window.electronAPI.getWindowPosition();
      if (position.success) {
        initialWindowX = position.x;
        initialWindowY = position.y;
      }
    } catch (error) {
      console.error('Error getting window position:', error);
    }
    
    // デバッグ情報を表示
    updateDebugStatus(`Drag started at ${dragStartX},${dragStartY}, window at ${initialWindowX},${initialWindowY}`);
  });

  // ドラッグ中イベント
  document.addEventListener('mousemove', (event) => {
    if (!isDragging) return;
    
    // 新しい位置を計算: ウィンドウの初期位置 + (現在のマウス位置 - ドラッグ開始時のマウス位置)
    const newX = initialWindowX + (event.screenX - dragStartX);
    const newY = initialWindowY + (event.screenY - dragStartY);
    
    // IPCを使用してウィンドウを指定位置に移動
    window.electronAPI.setWindowPosition(newX, newY);
    
    // デバッグ情報を表示
    updateDebugStatus(`Window moved to: ${newX},${newY}`);
  });

  // ドラッグ終了イベント
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      updateDebugStatus('Drag ended');
    }
  });

  // 初期化
  init();
});

/**
 * チャット吹き出しの表示/非表示を切り替える
 */
function toggleChatBubble(): void {
  isBubbleVisible = !isBubbleVisible;
  
  if (isBubbleVisible) {
    chatBubble.classList.remove('hidden');
    chatInput.focus();
  } else {
    chatBubble.classList.add('hidden');
  }
}

/**
 * メッセージを送信する
 */
async function sendMessage(): Promise<void> {
  const message = chatInput.value.trim();
  
  if (!message) {
    return;
  }
  
  // ユーザーのメッセージを表示
  addMessage(message, 'user');
  
  // 入力欄をクリア
  chatInput.value = '';
  
  try {
    // ChatGPT APIにメッセージを送信
    const response = await window.electronAPI.sendMessage(message);
    
    if (response.error) {
      addMessage(`エラー: ${response.error}`, 'mascot');
    } else {
      addMessage(response.response, 'mascot');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    addMessage('メッセージの送信中にエラーが発生しました。', 'mascot');
  }
}

/**
 * チャット内容にメッセージを追加する
 * @param text メッセージテキスト
 * @param sender 送信者（'user' または 'mascot'）
 */
function addMessage(text: string, sender: 'user' | 'mascot'): void {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(`message-${sender}`);
  messageElement.textContent = text;
  
  chatContent.appendChild(messageElement);
  
  // 自動スクロール
  chatContent.scrollTop = chatContent.scrollHeight;
}

/**
 * 初期化
 */
async function init(): Promise<void> {
  try {
    // 設定を取得
    const settings = await window.electronAPI.getSettings();
    
    // マスコットのサイズを設定
    if (settings.mascotSize) {
      mascotElement.style.transform = `scale(${settings.mascotSize})`;
    }
    
    // マスコットの位置を設定
    if (settings.mascotPosition) {
      mascotElement.style.position = 'absolute';
      mascotElement.style.left = `${settings.mascotPosition.x}px`;
      mascotElement.style.top = `${settings.mascotPosition.y}px`;
    }
  } catch (error) {
    console.error('Error initializing mascot:', error);
  }
}