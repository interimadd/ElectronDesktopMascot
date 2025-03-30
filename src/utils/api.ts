/**
 * API通信ユーティリティ
 */
import axios from 'axios';
import OpenAI from 'openai';
import { logger } from './logger';

/**
 * ChatGPT APIとの通信を行うクラス
 */
export class ChatGptApi {
  private openai: OpenAI | null = null;

  /**
   * APIクライアントを初期化する
   * @param apiKey OpenAI APIキー
   */
  public init(apiKey: string): void {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey
    });
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
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'あなたはデスクトップマスコットの猫です。かわいらしく、簡潔に応答してください。' },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const reply = response.choices[0]?.message?.content || 'すみません、応答できませんでした。';
      return reply;
    } catch (error) {
      logger.error('Error calling ChatGPT API:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
      }
      
      throw new Error('Failed to communicate with ChatGPT API');
    }
  }
}

// シングルトンインスタンスをエクスポート
export const chatGptApi = new ChatGptApi();