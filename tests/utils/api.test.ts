/**
 * ChatGptApi のテスト
 */
import { ChatGptApi } from '../../src/utils/api';
import axios from 'axios';

// モック
jest.mock('axios', () => ({
  isAxiosError: jest.fn()
}));
jest.mock('openai', () => {
  return {
    Configuration: jest.fn().mockImplementation(() => ({})),
    OpenAIApi: jest.fn().mockImplementation(() => ({
      createChatCompletion: jest.fn().mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: 'こんにちは！何かお手伝いできることはありますか？'
              }
            }
          ]
        }
      })
    }))
  };
});

describe('ChatGptApi', () => {
  let chatGptApi: ChatGptApi;

  beforeEach(() => {
    chatGptApi = new ChatGptApi();
  });

  test('init should throw error if API key is not provided', () => {
    expect(() => chatGptApi.init('')).toThrow('API key is required');
  });

  test('init should initialize OpenAI client', () => {
    chatGptApi.init('test-api-key');
    expect(chatGptApi['openai']).not.toBeNull();
  });

  test('sendMessage should throw error if client is not initialized', async () => {
    await expect(chatGptApi.sendMessage('こんにちは')).rejects.toThrow('API client is not initialized');
  });

  test('sendMessage should return response from ChatGPT', async () => {
    chatGptApi.init('test-api-key');
    const response = await chatGptApi.sendMessage('こんにちは');
    expect(response).toBe('こんにちは！何かお手伝いできることはありますか？');
  });

  test('sendMessage should handle error from API', async () => {
    chatGptApi.init('test-api-key');
    
    // モックの実装を上書き
    chatGptApi['openai']!.createChatCompletion = jest.fn().mockRejectedValue({
      response: {
        status: 401,
        data: {
          error: {
            message: 'Invalid API key'
          }
        }
      }
    });
    
    // axiosのモックを設定
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.isAxiosError.mockReturnValue(true);
    
    await expect(chatGptApi.sendMessage('こんにちは')).rejects.toThrow('API error: 401 - Invalid API key');
  });

  test('sendMessage should handle generic error', async () => {
    chatGptApi.init('test-api-key');
    
    // モックの実装を上書き
    chatGptApi['openai']!.createChatCompletion = jest.fn().mockRejectedValue(new Error('Network error'));
    
    // axiosのモックを設定
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.isAxiosError.mockReturnValue(false);
    
    await expect(chatGptApi.sendMessage('こんにちは')).rejects.toThrow('Failed to communicate with ChatGPT API');
  });
});