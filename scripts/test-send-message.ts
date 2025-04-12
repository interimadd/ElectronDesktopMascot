/**
 * api.tsのsendMessage関数の動作を確認するためのスクリプト
 * 
 * 使用方法:
 * npm run build
 * node dist/scripts/test-send-message.js <APIキー>
 * 
 * 例:
 * node dist/scripts/test-send-message.js sk-xxxxxxxxxxxx "Is this sentence grammatically correct?"
 */

import { chatGptApi } from '../src/utils/api';

// コマンドライン引数の取得
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('使用方法: node dist/scripts/test-send-message.js <APIキー>');
  process.exit(1);
}

const apiKey = args[0];

/**
 * sendMessage関数をテストする
 */
async function testSendMessage() {
  try {
    // APIクライアントの初期化
    console.log('APIクライアントを初期化中...');
    chatGptApi.init(apiKey);
    console.log('APIクライアント初期化完了');

    console.log('=== 文法の間違いがないメッセージの送信テスト ===');
    const messageWithoutGrammarErrors = 'What is the weather like today?';
    console.log('メッセージ:', messageWithoutGrammarErrors);
    const response = await chatGptApi.sendGrammarCheckMessage(messageWithoutGrammarErrors);
    console.log('=== レスポンス ===');
    console.log(response);

    console.log('=== 文法の間違いがあるメッセージの送信テスト ===');
    const messageWithGrammarErrors = 'I goes to the store yesterday.';
    console.log('メッセージ:', messageWithGrammarErrors);
    const responseWithErrors = await chatGptApi.sendGrammarCheckMessage(messageWithGrammarErrors);
    console.log('=== レスポンス ===');
    console.log(responseWithErrors);

  } catch (error) {
    console.error('エラーが発生しました:', error);
    console.error('エラー:', error instanceof Error ? error.message : String(error));
  }
}

// テストの実行
testSendMessage();