"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const electron_store_1 = __importDefault(require("electron-store"));
class ConfigManager {
    constructor() {
        this.defaultSettings = {
            apiKey: '',
            mascotSize: 1.0,
            mascotPosition: { x: 100, y: 100 },
            alwaysOnTop: true
        };
        this.store = new electron_store_1.default({
            name: 'electron-mascot-config',
            defaults: this.defaultSettings
        });
    }
    /**
     * 設定を保存する
     * @param settings 保存する設定
     */
    saveSettings(settings) {
        Object.keys(settings).forEach((key) => {
            const typedKey = key;
            this.store.set(typedKey, settings[typedKey]);
        });
    }
    /**
     * 全ての設定を取得する
     * @returns 全ての設定
     */
    getSettings() {
        return this.store.store;
    }
    /**
     * APIキーを取得する
     * @returns APIキー
     */
    getApiKey() {
        return this.store.get('apiKey', '');
    }
    /**
     * マスコットのサイズを取得する
     * @returns マスコットのサイズ
     */
    getMascotSize() {
        return this.store.get('mascotSize', 1.0);
    }
    /**
     * マスコットの位置を取得する
     * @returns マスコットの位置
     */
    getMascotPosition() {
        return this.store.get('mascotPosition', { x: 100, y: 100 });
    }
    /**
     * 常に最前面に表示するかどうかを取得する
     * @returns 常に最前面に表示するかどうか
     */
    getAlwaysOnTop() {
        return this.store.get('alwaysOnTop', true);
    }
    /**
     * マスコットの位置を保存する
     * @param x X座標
     * @param y Y座標
     */
    saveMascotPosition(x, y) {
        this.store.set('mascotPosition', { x, y });
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map