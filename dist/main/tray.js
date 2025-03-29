"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrayManager = void 0;
/**
 * システムトレイ管理クラス
 */
const electron_1 = require("electron");
const path = __importStar(require("path"));
class TrayManager {
    constructor(app) {
        this.tray = null;
        this.app = app;
    }
    /**
     * システムトレイの初期化
     */
    init() {
        // アプリケーションが終了するまでTrayオブジェクトを保持するために変数に代入
        this.tray = new electron_1.Tray(path.join(__dirname, '../../assets/tray-icon.png'));
        this.tray.setToolTip('Electron Mascot');
        this.tray.setContextMenu(this.createContextMenu());
    }
    /**
     * コンテキストメニューの作成
     * @returns コンテキストメニュー
     */
    createContextMenu() {
        return electron_1.Menu.buildFromTemplate([
            {
                label: 'マスコットを表示',
                click: () => {
                    this.app.showMascot();
                }
            },
            {
                label: '設定',
                click: () => {
                    this.app.createSettingsWindow();
                }
            },
            { type: 'separator' },
            {
                label: '終了',
                click: () => {
                    electron_1.app.quit();
                }
            }
        ]);
    }
}
exports.TrayManager = TrayManager;
//# sourceMappingURL=tray.js.map