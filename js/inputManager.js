/**
 * 入力管理クラス
 * キーボード入力の検出と処理を行う
 */
class InputManager {
    constructor() {
        // キーの状態管理
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
        
        // キーコードの定義
        this.KEY_CODES = {
            LEFT: 'ArrowLeft',
            RIGHT: 'ArrowRight',
            UP: 'ArrowUp',
            DOWN: 'ArrowDown',
            SPACE: ' ',
            ENTER: 'Enter',
            ESCAPE: 'Escape',
            P: 'p',
            P_UPPER: 'P'
        };
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        console.log('InputManager初期化完了');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // キーダウンイベント
        document.addEventListener('keydown', (event) => {
            event.preventDefault();
            const key = event.key;
            
            // 新しく押されたキーを記録
            if (!this.keys[key]) {
                this.keysPressed[key] = true;
            }
            
            this.keys[key] = true;
        });
        
        // キーアップイベント
        document.addEventListener('keyup', (event) => {
            event.preventDefault();
            const key = event.key;
            
            this.keys[key] = false;
            this.keysReleased[key] = true;
        });
        
        // フォーカス喪失時の処理
        window.addEventListener('blur', () => {
            this.clearAllKeys();
        });
    }
    
    /**
     * フレーム更新処理
     * 毎フレーム呼び出してキー状態をリセット
     */
    update() {
        // 押された瞬間とリリースされた瞬間の状態をクリア
        this.keysPressed = {};
        this.keysReleased = {};
    }
    
    /**
     * キーが押されているかチェック
     * @param {string} key - チェックするキー
     * @returns {boolean} キーが押されているかどうか
     */
    isKeyDown(key) {
        return !!this.keys[key];
    }
    
    /**
     * キーが押された瞬間かチェック
     * @param {string} key - チェックするキー
     * @returns {boolean} キーが押された瞬間かどうか
     */
    isKeyPressed(key) {
        return !!this.keysPressed[key];
    }
    
    /**
     * キーがリリースされた瞬間かチェック
     * @param {string} key - チェックするキー
     * @returns {boolean} キーがリリースされた瞬間かどうか
     */
    isKeyReleased(key) {
        return !!this.keysReleased[key];
    }
    
    /**
     * 左矢印キーが押されているかチェック
     * @returns {boolean}
     */
    isLeftPressed() {
        return this.isKeyDown(this.KEY_CODES.LEFT);
    }
    
    /**
     * 右矢印キーが押されているかチェック
     * @returns {boolean}
     */
    isRightPressed() {
        return this.isKeyDown(this.KEY_CODES.RIGHT);
    }
    
    /**
     * スペースキーが押された瞬間かチェック
     * @returns {boolean}
     */
    isShootPressed() {
        return this.isKeyPressed(this.KEY_CODES.SPACE);
    }
    
    /**
     * Pキーが押された瞬間かチェック（一時停止用）
     * @returns {boolean}
     */
    isPausePressed() {
        return this.isKeyPressed(this.KEY_CODES.P) || this.isKeyPressed(this.KEY_CODES.P_UPPER);
    }
    
    /**
     * Enterキーが押された瞬間かチェック
     * @returns {boolean}
     */
    isEnterPressed() {
        return this.isKeyPressed(this.KEY_CODES.ENTER);
    }
    
    /**
     * Escapeキーが押された瞬間かチェック
     * @returns {boolean}
     */
    isEscapePressed() {
        return this.isKeyPressed(this.KEY_CODES.ESCAPE);
    }
    
    /**
     * 全てのキー状態をクリア
     */
    clearAllKeys() {
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
    }
    
    /**
     * デバッグ用：現在押されているキーを取得
     * @returns {Array} 押されているキーの配列
     */
    getPressedKeys() {
        return Object.keys(this.keys).filter(key => this.keys[key]);
    }
}