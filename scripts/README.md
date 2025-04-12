# スクリプトツール

このディレクトリには、開発やテストに役立つユーティリティスクリプトが含まれています。

## api.tsのsendMessage関数テストスクリプト

`test-send-message.ts` は、`src/utils/api.ts` の `sendMessage` 関数の動作を確認するためのスクリプトです。このスクリプトを使用すると、Electron アプリケーション全体を起動せずに ChatGPT API との通信をテストできます。

### 準備

1. まず、プロジェクトのルートディレクトリで依存関係をインストールします（まだの場合）：

```bash
npm install
```

2. スクリプトとプロジェクトのソースコードを一緒にコンパイルします：

```bash
npx tsc -p scripts/tsconfig.json
```

このコマンドは、scripts ディレクトリ内のスクリプトと、それが依存する src ディレクトリ内のファイルを一緒にコンパイルします。

```bash
npx tsc -p scripts/tsconfig.json
```

### 使用方法

コンパイル後、以下のコマンドでスクリプトを実行できます：

```bash
node dist/scripts/test-send-message.js <APIキー> <メッセージ>
```

#### 例：

```bash
node dist/scripts/test-send-message.js sk-xxxxxxxxxxxx "Is this sentence grammatically correct?"
```

### 出力例

スクリプトは以下のような出力を生成します：

```
=== sendMessage関数のテスト開始 ===
メッセージ: Is this sentence grammatically correct?
APIクライアントを初期化中...
APIクライアント初期化完了
メッセージを送信中...
処理時間: 2.5秒
=== レスポンス ===
{"corrected_sentence":"This sentence is grammatically correct.","corrected_reason":"The sentence follows proper English grammar rules with a subject ('this sentence'), a verb ('is'), and a complement ('grammatically correct'). There are no errors to correct."}

=== 解析されたJSONレスポンス ===
修正された文:  This sentence is grammatically correct.
修正理由:  The sentence follows proper English grammar rules with a subject ('this sentence'), a verb ('is'), and a complement ('grammatically correct'). There are no errors to correct.

=== sendMessage関数のテスト完了 ===
```

### 注意事項

- このスクリプトを実行するには、有効な OpenAI API キーが必要です。
- API キーは機密情報なので、公開リポジトリにコミットしないように注意してください。
- API 呼び出しには料金が発生する場合があります。OpenAI の料金ポリシーを確認してください。