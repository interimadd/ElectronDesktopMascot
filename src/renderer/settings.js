/**
 * 設定画面のレンダラープロセス
 */

console.log('Settings renderer script is running');

// DOMが完全に読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded in settings.js');

  // DOM要素
  const apiKeyInput = document.getElementById('api-key');
  const mascotSizeInput = document.getElementById('mascot-size');
  const sizeValueSpan = document.getElementById('size-value');
  const alwaysOnTopCheckbox = document.getElementById('always-on-top');
  const saveButton = document.getElementById('save-button');

  console.log('Elements found:', {
    apiKeyInput: !!apiKeyInput,
    mascotSizeInput: !!mascotSizeInput,
    sizeValueSpan: !!sizeValueSpan,
    alwaysOnTopCheckbox: !!alwaysOnTopCheckbox,
    saveButton: !!saveButton
  });

  // マスコットサイズの表示を更新
  mascotSizeInput.addEventListener('input', () => {
    console.log('Size input changed');
    const sizeValue = parseFloat(mascotSizeInput.value);
    const percentage = Math.round(sizeValue * 100);
    sizeValueSpan.textContent = `${percentage}%`;
  });

  // 保存ボタンのクリックイベント
  saveButton.addEventListener('click', async (e) => {
    console.log('Save button clicked');
    await saveSettings();
    e.stopPropagation(); // イベントの伝播を停止
  });

  /**
   * 設定を保存する
   */
  async function saveSettings() {
    try {
      const settings = {
        apiKey: apiKeyInput.value,
        mascotSize: parseFloat(mascotSizeInput.value),
        alwaysOnTop: alwaysOnTopCheckbox.checked
      };
      
      console.log('Saving settings:', settings);
      const result = await window.electronAPI.saveSettings(settings);
      console.log('Save result:', result);
      
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
  async function loadSettings() {
    try {
      console.log('Loading settings');
      const settings = await window.electronAPI.getSettings();
      console.log('Settings loaded:', settings);
      
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
});