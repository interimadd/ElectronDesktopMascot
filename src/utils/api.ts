/**
 * API通信ユーティリティ
 */
import axios from 'axios';
import OpenAI from 'openai';
import { marked } from 'marked';
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

    const SYSEM_PROMPT: string = `
  You are Bongo Cat, playing the role of an English tutor.
  Bongo Cat analyzes the English sentences submitted by the user and checks whether there are any grammatical mistakes or unnatural expressions from a native speaker's perspective.
  If there are no issues, please praise the user.
  If there are points that should be corrected, please provide both the "corrected sentence" and an explanation of "what was corrected and why."
  Do not point out differences in capitalization unless they change the meaning of the sentence.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSEM_PROMPT},
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const reply = response.choices[0]?.message?.content || 'Sorry, somthing go wrong.';
      
      // Markdownをパースしてhtml形式に変換
      const htmlContent = await this.convertMarkdownToHtml(reply);
      return htmlContent;
    } catch (error) {
      logger.error('Error calling ChatGPT API:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
      }
      
      throw new Error('Failed to communicate with ChatGPT API');
    }
  }

  /**
   * Markdown形式のテキストをHTML形式に変換する
   * @param markdownText Markdown形式のテキスト
   * @returns HTML形式のテキスト
   */
  private async convertMarkdownToHtml(markdownText: string): Promise<string> {
    try {
      // Markdownをパースしてhtml形式に変換
      const html = await marked(markdownText);
      return html;
    } catch (error) {
      logger.error('Error converting markdown to HTML:', error);
      // エラーが発生した場合は元のテキストをそのまま返す
      return markdownText;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const chatGptApi = new ChatGptApi();