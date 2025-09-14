/**
 * ゲームオブジェクトのベースクラス
 * 位置、速度、描画の基本機能を提供
 */
class GameObject {
    constructor(x = 0, y = 0) {
        // ユニークID
        this.id = GameObject.generateId();
        
        // 位置
        this.x = x;
        this.y = y;
        
        // 速度
        this.vx = 0;
        this.vy = 0;
        
        // サイズ（衝突判定用）
        this.width = 20;
        this.height = 20;
        
        // 状態管理
        this.active = true;
        this.shouldDestroy = false;
        
        // 描画設定
        this.color = '#fff';
        this.visible = true;
        
        // ゲームエンジンへの参照
        this.gameEngine = null;
    }
    
    /**
     * ゲームエンジンの参照を設定
     * @param {GameEngine} gameEngine - ゲームエンジンのインスタンス
     */
    setGameEngine(gameEngine) {
        this.gameEngine = gameEngine;
    }
    
    /**
     * 更新処理（オーバーライド用）
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // 基本的な物理更新
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);
        
        // 境界チェック
        this.checkBounds();
    }
    
    /**
     * 描画処理（オーバーライド用）
     * @param {CanvasRenderingContext2D} ctx - Canvas描画コンテキスト
     */
    render(ctx) {
        if (!this.visible) return;
        
        // デフォルトの描画（矩形）
        if (this.gameEngine && this.gameEngine.renderer) {
            this.gameEngine.renderer.drawRect(
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height,
                this.color
            );
        }
    }
    
    /**
     * 境界チェック
     */
    checkBounds() {
        if (!this.gameEngine) return;
        
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        // 画面外に出た場合の処理（デフォルトでは削除）
        if (this.x + halfWidth < 0 || 
            this.x - halfWidth > this.gameEngine.width ||
            this.y + halfHeight < 0 || 
            this.y - halfHeight > this.gameEngine.height) {
            this.onOutOfBounds();
        }
    }
    
    /**
     * 画面外に出た時の処理（オーバーライド用）
     */
    onOutOfBounds() {
        this.destroy();
    }
    
    /**
     * オブジェクトの削除
     */
    destroy() {
        this.shouldDestroy = true;
        this.active = false;
    }
    
    /**
     * 他のオブジェクトとの衝突判定
     * @param {GameObject} other - 衝突判定を行う相手オブジェクト
     * @returns {boolean} 衝突しているかどうか
     */
    collidesWith(other) {
        if (!this.active || !other.active) return false;
        
        const thisLeft = this.x - this.width / 2;
        const thisRight = this.x + this.width / 2;
        const thisTop = this.y - this.height / 2;
        const thisBottom = this.y + this.height / 2;
        
        const otherLeft = other.x - other.width / 2;
        const otherRight = other.x + other.width / 2;
        const otherTop = other.y - other.height / 2;
        const otherBottom = other.y + other.height / 2;
        
        return !(thisRight < otherLeft || 
                thisLeft > otherRight || 
                thisBottom < otherTop || 
                thisTop > otherBottom);
    }
    
    /**
     * 衝突時の処理（オーバーライド用）
     * @param {GameObject} other - 衝突した相手オブジェクト
     */
    onCollision(other) {
        // デフォルトでは何もしない
    }
    
    /**
     * 中心座標を取得
     * @returns {Object} {x, y} 座標
     */
    getCenter() {
        return { x: this.x, y: this.y };
    }
    
    /**
     * 境界ボックスを取得
     * @returns {Object} {left, right, top, bottom} 境界
     */
    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2
        };
    }
    
    /**
     * 位置を設定
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * 速度を設定
     * @param {number} vx - X方向速度
     * @param {number} vy - Y方向速度
     */
    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }
    
    /**
     * サイズを設定
     * @param {number} width - 幅
     * @param {number} height - 高さ
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
    
    /**
     * 色を設定
     * @param {string} color - 色
     */
    setColor(color) {
        this.color = color;
    }
    
    /**
     * 他のオブジェクトからの距離を計算
     * @param {GameObject} other - 距離を測る相手オブジェクト
     * @returns {number} 距離
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 他のオブジェクトへの角度を計算（ラジアン）
     * @param {GameObject} other - 角度を測る相手オブジェクト
     * @returns {number} 角度（ラジアン）
     */
    angleTo(other) {
        return Math.atan2(other.y - this.y, other.x - this.x);
    }
    
    /**
     * ユニークIDを生成
     * @returns {string} ユニークID
     */
    static generateId() {
        return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}