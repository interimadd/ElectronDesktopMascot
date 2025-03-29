/**
 * API通信ユーティリティ
 */
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';

/**
 * ChatGPT APIとの通信を行うクラス
 */
export class ChatGptApi {
  private openai: OpenAIApi | null = null;

  /**
   * APIクライアントを初期化する
   * @param apiKey OpenAI APIキー
   */
  public init(apiKey: string): void {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const configuration = new Configuration({
      apiKey: apiKey
    });

    this.openai = new OpenAIApi(configuration);
  }

  /**
   * ChatGPT APIにメッセージを送信する
   * @param message ユーザーのメッセージ
   * @returns ChatGPTからのレスポンス
   */
  public async sendMessage(message: string): Promise<string> {
    if (!this.openai) {
      throw new Error('API client is not initialized');
    }

    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'あなたはデスクトップマスコットの猫です。かわいらしく、簡潔に応答してください。' },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const reply = response.data.choices[0]?.message?.content || 'すみません、応答できませんでした。';
      return reply;
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
      }
      
      throw new Error('Failed to communicate with ChatGPT API');
    }
  }
}

// シングルトンインスタンスをエクスポート
export const chatGptApi = new ChatGptApi();