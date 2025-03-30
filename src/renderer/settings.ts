/**
 * 設定画面のレンダラープロセス
 */

// DOM要素
const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
const mascotSizeInput = document.getElementById('mascot-size') as HTMLInputElement;
const sizeValueSpan = document.getElementById('size-value') as HTMLSpanElement;
const alwaysOnTopCheckbox = document.getElementById('always-on-top') as HTMLInputElement;
const saveButton = document.getElementById('save-button') as HTMLButtonElement;

// マスコットサイズの表示を更新
mascotSizeInput.addEventListener('input', () => {
  const sizeValue = parseFloat(mascotSizeInput.value);
  const percentage = Math.round(sizeValue * 100);
  sizeValueSpan.textContent = `${percentage}%`;
});

// 保存ボタンのクリックイベント
saveButton.addEventListener('click', async () => {
  await saveSettings();
});

/**
 * 設定を保存する
 */
async function saveSettings(): Promise<void> {
  try {
    const settings = {
      apiKey: apiKeyInput.value,
      mascotSize: parseFloat(mascotSizeInput.value),
      alwaysOnTop: alwaysOnTopCheckbox.checked
    };
    
    const result = await window.electronAPI.saveSettings(settings);
    
    if (result.success) {
      alert('設定を保存しました');
    } else if (result.error) {
      alert(`エラー: ${result.error}`);
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    alert('設定の保存中にエラーが発生しました');
  }
}

/**
 * 設定を読み込む
 */
async function loadSettings(): Promise<void> {
  try {
    const settings = await window.electronAPI.getSettings();
    
    if (settings.apiKey) {
      apiKeyInput.value = settings.apiKey;
    }
    
    if (settings.mascotSize) {
      mascotSizeInput.value = settings.mascotSize.toString();
      const percentage = Math.round(settings.mascotSize * 100);
      sizeValueSpan.textContent = `${percentage}%`;
    }
    
    if (settings.alwaysOnTop !== undefined) {
      alwaysOnTopCheckbox.checked = settings.alwaysOnTop;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// 初期化
loadSettings();