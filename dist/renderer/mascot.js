"use strict";
/**
 * マスコットのレンダラープロセス
 */
// DOM要素
const mascotElement = document.getElementById('mascot');
const chatBubble = document.getElementById('chat-bubble');
const chatContent = document.getElementById('chat-content');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
// 吹き出しの表示状態
let isBubbleVisible = false;
// マスコットのクリックイベント
mascotElement.addEventListener('click', () => {
    toggleChatBubble();
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
/**
 * チャット吹き出しの表示/非表示を切り替える
 */
function toggleChatBubble() {
    isBubbleVisible = !isBubbleVisible;
    if (isBubbleVisible) {
        chatBubble.classList.remove('hidden');
        chatInput.focus();
    }
    else {
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
    // ユーザーのメッセージを表示
    addMessage(message, 'user');
    // 入力欄をクリア
    chatInput.value = '';
    try {
        // ChatGPT APIにメッセージを送信
        const response = await window.electronAPI.sendMessage(message);
        if (response.error) {
            addMessage(`エラー: ${response.error}`, 'mascot');
        }
        else {
            addMessage(response.response, 'mascot');
        }
    }
    catch (error) {
        console.error('Error sending message:', error);
        addMessage('メッセージの送信中にエラーが発生しました。', 'mascot');
    }
}
/**
 * チャット内容にメッセージを追加する
 * @param text メッセージテキスト
 * @param sender 送信者（'user' または 'mascot'）
 */
function addMessage(text, sender) {
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
    isDragging = true;
    offsetX = e.clientX - mascotElement.getBoundingClientRect().left;
    offsetY = e.clientY - mascotElement.getBoundingClientRect().top;
});
document.addEventListener('mousemove', (e) => {
    if (!isDragging)
        return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    mascotElement.style.position = 'absolute';
    mascotElement.style.left = `${x}px`;
    mascotElement.style.top = `${y}px`;
});
document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        // 位置を保存
        const x = parseInt(mascotElement.style.left || '0', 10);
        const y = parseInt(mascotElement.style.top || '0', 10);
        window.electronAPI.saveMascotPosition(x, y);
    }
});
// 初期化
async function init() {
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
    }
    catch (error) {
        console.error('Error initializing mascot:', error);
    }
}
// アプリケーションの初期化
init();
//# sourceMappingURL=mascot.js.map