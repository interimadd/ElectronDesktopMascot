/**
 * マスコットのレンダラープロセス
 */

console.log('Mascot renderer script is running');

// DOMが完全に読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded in mascot.js');
  
  // DOM要素
  const mascotElement = document.getElementById('mascot');
  const chatBubble = document.getElementById('chat-bubble');
  const chatContent = document.getElementById('chat-content');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  
  console.log('Elements found:', {
    mascot: !!mascotElement,
    chatBubble: !!chatBubble,
    chatContent: !!chatContent,
    chatInput: !!chatInput,
    sendButton: !!sendButton
  });

  // 吹き出しの表示状態
  let isBubbleVisible = false;

  // マスコットのクリックイベント
  mascotElement.addEventListener('click', (e) => {
    console.log('Mascot clicked!');
    toggleChatBubble();
    e.stopPropagation(); // イベントの伝播を停止
  });
  
  // マスコットの右クリックイベント（コンテキストメニュー）
  mascotElement.addEventListener('contextmenu', (e) => {
    console.log('Mascot right-clicked!');
    e.preventDefault(); // デフォルトのコンテキストメニューを表示しない
    
    // 設定画面を開く
    window.electronAPI.openSettings();
    
    e.stopPropagation(); // イベントの伝播を停止
  });

  // チャット送信ボタンのクリックイベント
  sendButton.addEventListener('click', (e) => {
    console.log('Send button clicked!');
    sendMessage();
    e.stopPropagation(); // イベントの伝播を停止
  });

  // チャット入力のキーダウンイベント（Enterキーで送信）
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      console.log('Enter key pressed!');
      sendMessage();
    }
  });

  /**
   * チャット吹き出しの表示/非表示を切り替える
   */
  function toggleChatBubble() {
    console.log('Toggling chat bubble, current state:', isBubbleVisible);
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
  async function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message) {
      return;
    }
    
    console.log('Sending message:', message);
    
    // ユーザーのメッセージを表示
    addMessage(message, 'user');
    
    // 入力欄をクリア
    chatInput.value = '';
    
    try {
      // ChatGPT APIにメッセージを送信
      console.log('Calling electronAPI.sendMessage');
      const response = await window.electronAPI.sendMessage(message);
      console.log('Response received:', response);
      
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
   * @param {string} text メッセージテキスト
   * @param {string} sender 送信者（'user' または 'mascot'）
   */
  function addMessage(text, sender) {
    console.log('Adding message:', { text, sender });
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(`message-${sender}`);
    messageElement.textContent = text;
    
    chatContent.appendChild(messageElement);
    
    // 自動スクロール
    chatContent.scrollTop = chatContent.scrollHeight;
  }

  // ドラッグ機能の実装
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  mascotElement.addEventListener('mousedown', (e) => {
    console.log('Mouse down on mascot');
    isDragging = true;
    offsetX = e.clientX - mascotElement.getBoundingClientRect().left;
    offsetY = e.clientY - mascotElement.getBoundingClientRect().top;
    e.stopPropagation(); // イベントの伝播を停止
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    console.log('Mouse move while dragging');
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    mascotElement.style.position = 'absolute';
    mascotElement.style.left = `${x}px`;
    mascotElement.style.top = `${y}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      console.log('Mouse up after dragging');
      isDragging = false;
      
      // 位置を保存
      const x = parseInt(mascotElement.style.left || '0', 10);
      const y = parseInt(mascotElement.style.top || '0', 10);
      
      window.electronAPI.saveMascotPosition(x, y);
    }
  });

  // 初期化
  async function init() {
    console.log('Initializing mascot');
    try {
      // 設定を取得
      console.log('Getting settings');
      const settings = await window.electronAPI.getSettings();
      console.log('Settings received:', settings);
      
      // マスコットのサイズを設定
      if (settings.mascotSize) {
        console.log('Setting mascot size:', settings.mascotSize);
        mascotElement.style.transform = `scale(${settings.mascotSize})`;
      }
      
      // マスコットの位置を設定
      if (settings.mascotPosition) {
        console.log('Setting mascot position:', settings.mascotPosition);
        mascotElement.style.position = 'absolute';
        mascotElement.style.left = `${settings.mascotPosition.x}px`;
        mascotElement.style.top = `${settings.mascotPosition.y}px`;
      }
    } catch (error) {
      console.error('Error initializing mascot:', error);
    }
  }

  // アプリケーションの初期化
  init();
});