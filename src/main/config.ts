/**
 * 設定管理クラス
 */
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import Store from 'electron-store';

interface Settings {
  apiKey?: string;
  mascotSize?: number;
  mascotPosition?: { x: number; y: number };
  alwaysOnTop?: boolean;
}

export class ConfigManager {
  private store: Store<Settings>;
  private readonly defaultSettings: Settings = {
    apiKey: '',
    mascotSize: 1.0,
    mascotPosition: { x: 100, y: 100 },
    alwaysOnTop: true
  };

  constructor() {
    this.store = new Store<Settings>({
      name: 'electron-mascot-config',
      defaults: this.defaultSettings
    });
  }

  /**
   * 設定を保存する
   * @param settings 保存する設定
   */
  public saveSettings(settings: Partial<Settings>): void {
    Object.keys(settings).forEach((key) => {
      const typedKey = key as keyof Settings;
      this.store.set(typedKey, settings[typedKey]);
    });
  }

  /**
   * 全ての設定を取得する
   * @returns 全ての設定
   */
  public getSettings(): Settings {
    return this.store.store;
  }

  /**
   * APIキーを取得する
   * @returns APIキー
   */
  public getApiKey(): string {
    return this.store.get('apiKey', '');
  }

  /**
   * マスコットのサイズを取得する
   * @returns マスコットのサイズ
   */
  public getMascotSize(): number {
    return this.store.get('mascotSize', 1.0);
  }

  /**
   * マスコットの位置を取得する
   * @returns マスコットの位置
   */
  public getMascotPosition(): { x: number; y: number } {
    return this.store.get('mascotPosition', { x: 100, y: 100 });
  }

  /**
   * 常に最前面に表示するかどうかを取得する
   * @returns 常に最前面に表示するかどうか
   */
  public getAlwaysOnTop(): boolean {
    return this.store.get('alwaysOnTop', true);
  }

  /**
   * マスコットの位置を保存する
   * @param x X座標
   * @param y Y座標
   */
  public saveMascotPosition(x: number, y: number): void {
    this.store.set('mascotPosition', { x, y });
  }
}