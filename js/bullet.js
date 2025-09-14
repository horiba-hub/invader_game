/**
 * 弾丸クラス
 * プレイヤーと敵の弾丸を管理
 */
class Bullet extends GameObject {
    constructor(x, y, vx = 0, vy = -400, isPlayerBullet = true) {
        super(x, y);
        
        // 弾丸固有の設定
        this.width = 4;
        this.height = 8;
        this.setVelocity(vx, vy);
        
        // 弾丸の種類
        this.isPlayerBullet = isPlayerBullet;
        
        // 色の設定
        if (isPlayerBullet) {
            this.color = '#ffff00'; // プレイヤーの弾は黄色
        } else {
            this.color = '#ff0000'; // 敵の弾は赤色
        }
        
        // ダメージ
        this.damage = 1;
        
        // 貫通機能
        this.piercing = false;
        this.maxPierceCount = 0;
        this.pierceCount = 0;
        
        // エフェクト用
        this.trail = [];
        this.maxTrailLength = 5;
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // 軌跡の更新
        this.updateTrail();
        
        // 高速弾丸の場合は複数回に分けて移動（衝突判定の精度向上）
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 600) { // 600ピクセル/秒以上の場合
            const steps = Math.ceil(speed / 400); // 400ピクセル/秒ごとに分割
            const stepDelta = deltaTime / steps;
            
            for (let i = 0; i < steps && this.active; i++) {
                super.update(stepDelta);
            }
        } else {
            // 基本更新処理
            super.update(deltaTime);
        }
    }
    
    /**
     * 軌跡の更新
     */
    updateTrail() {
        // 現在位置を軌跡に追加
        this.trail.push({ x: this.x, y: this.y });
        
        // 軌跡の長さを制限
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} ctx - Canvas描画コンテキスト
     */
    render(ctx) {
        if (!this.visible || !this.gameEngine) return;
        
        const renderer = this.gameEngine.renderer;
        
        // 軌跡の描画
        this.renderTrail(renderer);
        
        // 弾丸本体の描画
        if (this.isPlayerBullet) {
            // プレイヤーの弾丸（円形）
            renderer.drawBullet(this.x, this.y, this.width, this.color);
        } else {
            // 敵の弾丸（矩形）
            renderer.drawRect(
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height,
                this.color
            );
        }
    }
    
    /**
     * 軌跡の描画
     * @param {Renderer} renderer - レンダラー
     */
    renderTrail(renderer) {
        if (this.trail.length < 2) return;
        
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = (i + 1) / this.trail.length;
            const trailColor = this.isPlayerBullet ? 
                `rgba(255, 255, 0, ${alpha * 0.5})` : 
                `rgba(255, 0, 0, ${alpha * 0.5})`;
            
            const point = this.trail[i];
            const size = (this.width * alpha) / 2;
            
            renderer.drawCircle(point.x, point.y, size, trailColor);
        }
    }
    
    /**
     * 衝突時の処理
     * @param {GameObject} other - 衝突した相手オブジェクト
     */
    onCollision(other) {
        // プレイヤーの弾丸の場合
        if (this.isPlayerBullet) {
            if (other instanceof Enemy) {
                // 敵にダメージを与える
                other.takeDamage(this.damage);
                
                // 貫通判定
                if (this.piercing && this.pierceCount < this.maxPierceCount) {
                    this.pierceCount++;
                    console.log(`貫通: ${this.pierceCount}/${this.maxPierceCount}`);
                } else {
                    this.destroy();
                }
            }
        }
        // 敵の弾丸の場合
        else {
            if (other instanceof Player) {
                // プレイヤーにダメージを与える
                other.takeDamage(this.damage);
                this.destroy();
            }
        }
    }
    
    /**
     * 画面外に出た時の処理
     */
    onOutOfBounds() {
        // 弾丸は画面外に出たら削除
        this.destroy();
    }
    
    /**
     * 弾丸の削除時の処理
     */
    destroy() {
        super.destroy();
        // 削除時のエフェクトは後で追加可能
    }
}

/**
 * 特殊弾丸クラス（将来の武器システム用）
 */
class SpecialBullet extends Bullet {
    constructor(x, y, vx, vy, isPlayerBullet, bulletType = 'normal') {
        super(x, y, vx, vy, isPlayerBullet);
        
        this.bulletType = bulletType;
        
        // 弾丸タイプに応じた設定
        switch (bulletType) {
            case 'rapid':
                this.damage = 1;
                this.color = this.isPlayerBullet ? '#00ffff' : '#ff8800';
                break;
                
            case 'spread':
                this.damage = 1;
                this.color = this.isPlayerBullet ? '#ff00ff' : '#ff4400';
                break;
                
            case 'laser':
                this.damage = 2;
                this.width = 6;
                this.height = 12;
                this.color = this.isPlayerBullet ? '#00ff00' : '#ff0000';
                break;
                
            default:
                // 通常弾丸と同じ
                break;
        }
    }
    
    /**
     * 特殊弾丸の描画
     * @param {CanvasRenderingContext2D} ctx - Canvas描画コンテキスト
     */
    render(ctx) {
        if (!this.visible || !this.gameEngine) return;
        
        const renderer = this.gameEngine.renderer;
        
        switch (this.bulletType) {
            case 'laser':
                // レーザー弾の描画（長い矩形）
                renderer.drawRect(
                    this.x - this.width / 2,
                    this.y - this.height / 2,
                    this.width,
                    this.height,
                    this.color
                );
                // 光るエフェクト
                renderer.drawRect(
                    this.x - this.width / 4,
                    this.y - this.height / 2,
                    this.width / 2,
                    this.height,
                    '#ffffff'
                );
                break;
                
            default:
                // 通常の描画
                super.render(ctx);
                break;
        }
    }
}