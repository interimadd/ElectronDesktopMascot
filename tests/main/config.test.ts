/**
 * ConfigManager のテスト
 */
import { ConfigManager } from '../../src/main/config';

// モック
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn().mockReturnValue('/tmp')
  }
}));

jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => ({
    store: {
      apiKey: 'test-api-key',
      mascotSize: 1.2,
      mascotPosition: { x: 200, y: 300 },
      alwaysOnTop: true
    },
    get: jest.fn((key, defaultValue) => {
      const store = {
        apiKey: 'test-api-key',
        mascotSize: 1.2,
        mascotPosition: { x: 200, y: 300 },
        alwaysOnTop: true
      };
      return store[key] !== undefined ? store[key] : defaultValue;
    }),
    set: jest.fn()
  }));
});

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  test('getSettings should return all settings', () => {
    const settings = configManager.getSettings();
    expect(settings).toEqual({
      apiKey: 'test-api-key',
      mascotSize: 1.2,
      mascotPosition: { x: 200, y: 300 },
      alwaysOnTop: true
    });
  });

  test('getApiKey should return API key', () => {
    const apiKey = configManager.getApiKey();
    expect(apiKey).toBe('test-api-key');
  });

  test('getMascotSize should return mascot size', () => {
    const size = configManager.getMascotSize();
    expect(size).toBe(1.2);
  });

  test('getMascotPosition should return mascot position', () => {
    const position = configManager.getMascotPosition();
    expect(position).toEqual({ x: 200, y: 300 });
  });

  test('getAlwaysOnTop should return always on top setting', () => {
    const alwaysOnTop = configManager.getAlwaysOnTop();
    expect(alwaysOnTop).toBe(true);
  });

  test('saveMascotPosition should save mascot position', () => {
    configManager.saveMascotPosition(400, 500);
    expect(configManager['store'].set).toHaveBeenCalledWith('mascotPosition', { x: 400, y: 500 });
  });

  test('saveSettings should save settings', () => {
    const settings = {
      apiKey: 'new-api-key',
      mascotSize: 1.5
    };
    configManager.saveSettings(settings);
    expect(configManager['store'].set).toHaveBeenCalledWith('apiKey', 'new-api-key');
    expect(configManager['store'].set).toHaveBeenCalledWith('mascotSize', 1.5);
  });
});