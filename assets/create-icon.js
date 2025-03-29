/**
 * Base64エンコードされたデータをPNGファイルに変換するスクリプト
 */
const fs = require('fs');
const path = require('path');

// Base64データを読み込む
const base64Data = fs.readFileSync(path.join(__dirname, 'tray-icon-base64.txt'), 'utf8');

// Base64データをバイナリデータに変換
const binaryData = Buffer.from(base64Data, 'base64');

// PNGファイルとして保存
fs.writeFileSync(path.join(__dirname, 'tray-icon.png'), binaryData);

console.log('トレイアイコンが正常に作成されました: assets/tray-icon.png');