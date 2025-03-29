"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatGptApi = exports.ChatGptApi = void 0;
/**
 * API通信ユーティリティ
 */
const axios_1 = __importDefault(require("axios"));
const openai_1 = require("openai");
/**
 * ChatGPT APIとの通信を行うクラス
 */
class ChatGptApi {
    constructor() {
        this.openai = null;
    }
    /**
     * APIクライアントを初期化する
     * @param apiKey OpenAI APIキー
     */
    init(apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
        const configuration = new openai_1.Configuration({
            apiKey: apiKey
        });
        this.openai = new openai_1.OpenAIApi(configuration);
    }
    /**
     * ChatGPT APIにメッセージを送信する
     * @param message ユーザーのメッセージ
     * @returns ChatGPTからのレスポンス
     */
    async sendMessage(message) {
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
        }
        catch (error) {
            console.error('Error calling ChatGPT API:', error);
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new Error(`API error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
            }
            throw new Error('Failed to communicate with ChatGPT API');
        }
    }
}
exports.ChatGptApi = ChatGptApi;
// シングルトンインスタンスをエクスポート
exports.chatGptApi = new ChatGptApi();
//# sourceMappingURL=api.js.map