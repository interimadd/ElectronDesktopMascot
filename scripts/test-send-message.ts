/**
 * api.tsのsendMessage関数の動作を確認するためのスクリプト
 * 
 * 使用方法:
 * npm run build
 * node dist/scripts/test-send-message.js <APIキー> <メッセージ>
 * 
 * 例:
 * node dist/scripts/test-send-message.js sk-xxxxxxxxxxxx "Is this sentence grammatically correct?"
 */

import { chatGptApi } from '../src/utils/api';
import { logger } from '../src/utils/logger';

// コマンドライン引数の取得
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('使用方法: node dist/scripts/test-send-message.js <APIキー> <メッセージ>');
  process.exit(1);
}

const apiKey = args[0];
const message = args[1];

/**
 * sendMessage関数をテストする
 */
async function testSendMessage() {
  try {
    console.log('=== sendMessage関数のテスト開始 ===');
    console.log(`メッセージ: ${message}`);
    
    // APIクライアントの初期化
    console.log('APIクライアントを初期化中...');
    chatGptApi.init(apiKey);
    console.log('APIクライアント初期化完了');
    
    // メッセージの送信
    console.log('メッセージを送信中...');
    const startTime = Date.now();
    const response = await chatGptApi.sendMessage(message);
    const endTime = Date.now();
    
    console.log(`処理時間: ${(endTime - startTime) / 1000}秒`);
    console.log('=== レスポンス ===');
    console.log(response);
    
    // JSONレスポンスの解析を試みる
    try {
      // HTMLタグを除去して純粋なテキストを取得
      const plainText = response.replace(/<[^>]*>/g, '');
      const jsonResponse = JSON.parse(plainText);
      
      console.log('\n=== 解析されたJSONレスポンス ===');
      console.log('修正された文: ', jsonResponse.corrected_sentence);
      console.log('修正理由: ', jsonResponse.corrected_reason);
    } catch (error) {
      console.log('\nJSONとして解析できませんでした。HTMLレスポンスのままです。');
    }
    
    console.log('\n=== sendMessage関数のテスト完了 ===');
  } catch (error) {
    logger.error('エラーが発生しました:', error);
    console.error('エラー:', error instanceof Error ? error.message : String(error));
  }
}

// テストの実行
testSendMessage();