/**
 * 武器アイテムクラス
 * 敵を倒した時にドロップされる武器アイテム
 */
class WeaponPickup extends GameObject {
    constructor(x, y, weaponType = null) {
        super(x, y);
        
        // 武器タイプの決定（nullの場合はランダム）
        this.weaponType = weaponType || this.selectRandomWeaponType();
        
        // 武器アイテム固有の設定
        this.width = 16;
        this.height = 16;
        this.setupWeaponAppearance();
        
        // 物理効果
        this.vx = (Math.random() - 0.5) * 50; // 少し横に散らばる
        this.vy = -30; // 少し上に跳ねる
        this.gravity = 100; // 重力
        this.bounce = 0.3; // バウンス係数
        
        // 浮遊効果
        this.floatOffset = 0;
        this.floatSpeed = 3;
        this.floatAmplitude = 5;
        
        // 寿命とエフェクト
        this.lifetime = 15000; // 15秒
        this.age = 0;
        this.blinkThreshold = 0.7; // 寿命の70%で点滅開始
        
        // 磁力効果（プレイヤーが近づくと引き寄せられる）
        this.magnetRange = 60;
        this.magnetForce = 200;
        
        console.log(`武器アイテム作成: ${this.weaponType} at (${x}, ${y})`);
    }
    
    /**
     * ランダムな武器タイプを選択
     * @returns {string} 武器タイプ
     */
    selectRandomWeaponType() {
        const weaponTypes = ['rapid', 'spread', 'laser'];
        const weights = [0.5, 0.3, 0.2]; // rapid: 50%, spread: 30%, laser: 20%
        
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < weaponTypes.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return weaponTypes[i];
            }
        }
        
        return weaponTypes[0]; // フォールバック
    }
    
    /**
     * 武器タイプに応じた外観を設定
     */
    setupWeaponAppearance() {
        switch (this.weaponType) {
            case 'rapid':
                this.color = '#00ffff';
                break;
            case 'spread':
                this.color = '#ff00ff';
                break;
            case 'laser':
                this.color = '#00ff00';
                break;
            default:
                this.color = '#ffff00';
                break;
        }
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // 物理効果の更新
        this.updatePhysics(deltaTime);
        
        // プレイヤーとの磁力効果
        this.updateMagnetism(deltaTime);
        
        // 浮遊効果
        this.floatOffset += this.floatSpeed * (deltaTime / 1000);
        
        // デバッグログは削除
        
        // 寿命管理
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            this.createExpireEffect();
            this.destroy();
        }
        
        // 基本更新処理
        super.update(deltaTime);
    }
    
    /**
     * 物理効果の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updatePhysics(deltaTime) {
        const dt = deltaTime / 1000;
        
        // 重力を適用
        this.vy += this.gravity * dt;
        
        // 地面でのバウンス
        if (this.gameEngine) {
            const groundY = this.gameEngine.height - 80;
            if (this.y >= groundY && this.vy > 0) {
                this.y = groundY;
                this.vy *= -this.bounce;
                this.vx *= 0.8; // 摩擦
                
                // 小さなバウンスは停止
                if (Math.abs(this.vy) < 20) {
                    this.vy = 0;
                    this.vx *= 0.9;
                }
            }
        }
    }
    
    /**
     * プレイヤーとの磁力効果
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateMagnetism(deltaTime) {
        if (!this.gameEngine) return;
        
        const player = this.gameEngine.gameObjects.find(obj => obj instanceof Player);
        if (!player) return;
        
        const distance = this.distanceTo(player);
        if (distance <= this.magnetRange) {
            const dt = deltaTime / 1000;
            const force = this.magnetForce * (1 - distance / this.magnetRange);
            
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const normalizedDistance = Math.max(distance, 1);
            
            this.vx += (dx / normalizedDistance) * force * dt;
            this.vy += (dy / normalizedDistance) * force * dt;
        }
    }
    
    /**
     * 期限切れエフェクトの作成
     */
    createExpireEffect() {
        console.log('武器アイテムが期限切れで消失');
        // パーティクルエフェクトなどを後で追加可能
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} ctx - Canvas描画コンテキスト
     */
    render(ctx) {
        if (!this.visible || !this.gameEngine) return;
        
        const renderer = this.gameEngine.renderer;
        
        // 寿命に応じて点滅
        const lifeRatio = this.age / this.lifetime;
        if (lifeRatio > this.blinkThreshold) {
            const blinkRate = 150;
            const shouldShow = Math.floor(this.age / blinkRate) % 2 === 0;
            if (!shouldShow) return;
        }
        
        // 浮遊効果
        const floatY = Math.sin(this.floatOffset) * this.floatAmplitude;
        const drawY = this.y + floatY;
        
        // 武器アイテムの描画
        renderer.drawWeaponPickup(this.x, drawY, this.width, this.color);
        
        // 武器タイプのテキスト表示
        const weaponName = this.weaponType.charAt(0).toUpperCase() + this.weaponType.slice(1);
        renderer.drawTextCentered(
            weaponName,
            this.x, drawY - this.height,
            this.color,
            '10px Courier New'
        );
        
        // デバッグ表示は削除
        
        // 取得可能エフェクト
        if (this.isNearPlayer()) {
            const pulseAlpha = 0.3 + 0.2 * Math.sin(this.floatOffset * 2);
            renderer.drawCircle(this.x, drawY, this.width + 5, `rgba(255, 255, 255, ${pulseAlpha})`);
        }
    }
    
    /**
     * プレイヤーが近くにいるかチェック
     * @returns {boolean} プレイヤーが近くにいるかどうか
     */
    isNearPlayer() {
        if (!this.gameEngine) return false;
        
        const player = this.gameEngine.gameObjects.find(obj => obj instanceof Player);
        if (!player) return false;
        
        return this.distanceTo(player) <= this.magnetRange;
    }
    
    /**
     * 衝突時の処理
     * @param {GameObject} other - 衝突した相手オブジェクト
     */
    onCollision(other) {
        if (other instanceof Player && this.active) {
            console.log(`武器アイテム取得: ${this.weaponType}`);
            
            // プレイヤーの武器をアップグレード
            other.upgradeWeapon();
            
            // アイテムを削除
            this.destroy();
        }
    }
}