/**
 * 敵クラス
 * インベーダーの移動パターンと基本的な行動を管理
 */
class Enemy extends GameObject {
    constructor(x, y, enemyType = 'basic') {
        super(x, y);
        
        // 敵固有の設定
        this.enemyType = enemyType;
        this.width = 16;
        this.height = 16;
        this.color = '#ff0000';
        
        // 移動関連
        this.baseSpeed = 50; // ピクセル/秒
        this.speed = this.baseSpeed;
        this.direction = 1; // 1: 右, -1: 左
        this.dropDistance = 20; // 下に移動する距離
        
        // 体力とスコア
        this.maxHealth = 1;
        this.health = this.maxHealth;
        this.points = 10; // 撃破時のスコア
        
        // 射撃関連
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootCooldownTime = 2000 + Math.random() * 3000; // 2-5秒のランダム
        this.shootProbability = 0.001; // 毎フレームの射撃確率
        
        // アニメーション
        this.animationTime = 0;
        this.animationFrame = 0;
        this.animationSpeed = 500; // ミリ秒
        
        // 敵タイプに応じた設定
        this.setupEnemyType();
        
        console.log(`${this.enemyType}敵を作成: (${x}, ${y})`);
    }
    
    /**
     * 敵タイプに応じた設定
     */
    setupEnemyType() {
        switch (this.enemyType) {
            case 'fast':
                this.speed = this.baseSpeed * 1.5;
                this.color = '#ff8800';
                this.points = 20;
                this.shootProbability = 0.002;
                break;
                
            case 'strong':
                this.maxHealth = 2;
                this.health = this.maxHealth;
                this.color = '#8800ff';
                this.points = 30;
                this.width = 20;
                this.height = 20;
                break;
                
            case 'shooter':
                this.color = '#ff0088';
                this.points = 15;
                this.shootProbability = 0.005;
                this.shootCooldownTime = 1000 + Math.random() * 2000;
                break;
                
            default: // 'basic'
                // デフォルト設定を使用
                break;
        }
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // アニメーション更新
        this.updateAnimation(deltaTime);
        
        // 移動処理
        this.updateMovement(deltaTime);
        
        // 射撃処理
        this.updateShooting(deltaTime);
        
        // 基本更新処理
        super.update(deltaTime);
    }
    
    /**
     * アニメーション更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateAnimation(deltaTime) {
        this.animationTime += deltaTime;
        if (this.animationTime >= this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTime = 0;
        }
    }
    
    /**
     * 移動処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateMovement(deltaTime) {
        // 水平移動
        this.vx = this.speed * this.direction;
        
        // 画面端での方向転換は EnemyFormation クラスで管理
    }
    
    /**
     * 射撃処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateShooting(deltaTime) {
        // 射撃クールダウンの更新
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
            if (this.shootCooldown <= 0) {
                this.canShoot = true;
            }
        }
        
        // ランダム射撃
        if (this.canShoot && Math.random() < this.shootProbability) {
            this.shoot();
        }
    }
    
    /**
     * 弾発射
     */
    shoot() {
        if (!this.canShoot || !this.gameEngine) return;
        
        // 敵の弾丸を発射
        const bullet = new Bullet(
            this.x, 
            this.y + this.height / 2 + 5, 
            0, 
            200, // 下向きに発射
            false // 敵の弾丸
        );
        this.gameEngine.addGameObject(bullet);
        
        // 射撃クールダウン開始
        this.canShoot = false;
        this.shootCooldown = this.shootCooldownTime;
        
        console.log(`${this.enemyType}敵が弾を発射`);
    }
    
    /**
     * ダメージを受ける
     * @param {number} damage - ダメージ量
     */
    takeDamage(damage = 1) {
        if (!this.active) return;
        
        this.health -= damage;
        console.log(`敵がダメージを受けた。残り体力: ${this.health}`);
        
        if (this.health <= 0) {
            this.onDeath();
        } else {
            // ダメージエフェクト（色を一時的に変更）
            this.showDamageEffect();
        }
    }
    
    /**
     * ダメージエフェクトの表示
     */
    showDamageEffect() {
        const originalColor = this.color;
        this.color = '#ffffff';
        
        // 100ms後に元の色に戻す
        setTimeout(() => {
            this.color = originalColor;
        }, 100);
    }
    
    /**
     * 死亡時の処理
     */
    onDeath() {
        console.log(`${this.enemyType}敵が撃破された。スコア: ${this.points}`);
        
        // スコア加算
        this.addScore(this.points);
        
        // 武器ドロップの判定
        this.checkWeaponDrop();
        
        // 爆発エフェクト（後で実装）
        this.createExplosion();
        
        // オブジェクトを削除
        this.destroy();
    }
    
    /**
     * スコア加算
     * @param {number} points - 加算するスコア
     */
    addScore(points) {
        if (this.gameEngine && this.gameEngine.gameStateManager) {
            this.gameEngine.gameStateManager.addScore(points);
            
            // UISystemに通知
            if (this.gameEngine.uiSystem) {
                const totalScore = this.gameEngine.gameStateManager.getGameState().score;
                this.gameEngine.uiSystem.onScoreAdd(points, totalScore);
            }
        }
    }
    
    /**
     * 武器ドロップの判定
     */
    checkWeaponDrop() {
        // 20%の確率で武器をドロップ
        if (Math.random() < 0.2) {
            console.log('武器アイテムをドロップ');
            const weaponPickup = new WeaponPickup(this.x, this.y);
            this.gameEngine.addGameObject(weaponPickup);
        }
    }
    
    /**
     * 爆発エフェクトの作成
     */
    createExplosion() {
        // Explosion クラスは後で実装
        console.log(`爆発エフェクト: (${this.x}, ${this.y})`);
    }
    
    /**
     * 方向転換
     */
    changeDirection() {
        this.direction *= -1;
        this.y += this.dropDistance;
        console.log(`敵が方向転換: 新しい方向=${this.direction}`);
    }
    
    /**
     * 速度の設定
     * @param {number} speed - 新しい速度
     */
    setSpeed(speed) {
        this.speed = speed;
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} ctx - Canvas描画コンテキスト
     */
    render(ctx) {
        if (!this.visible || !this.gameEngine) return;
        
        const renderer = this.gameEngine.renderer;
        
        // 敵の描画（アニメーションフレームに応じて少し変化）
        const offsetY = this.animationFrame * 2;
        renderer.drawEnemy(this.x, this.y + offsetY, Math.max(this.width, this.height), this.color);
        
        // 体力が複数ある場合は体力バーを表示
        if (this.maxHealth > 1) {
            this.renderHealthBar(renderer);
        }
        
        // デバッグ情報（開発時のみ）
        if (false) { // デバッグモード
            renderer.drawText(
                `${this.enemyType}`, 
                this.x - this.width / 2, 
                this.y - this.height / 2 - 15, 
                '#ffffff', 
                '10px Courier New'
            );
        }
    }
    
    /**
     * 体力バーの描画
     * @param {Renderer} renderer - レンダラー
     */
    renderHealthBar(renderer) {
        const barWidth = this.width;
        const barHeight = 3;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.height / 2 - 8;
        
        // 背景
        renderer.drawRect(barX, barY, barWidth, barHeight, '#333333');
        
        // 体力バー
        const healthRatio = this.health / this.maxHealth;
        const healthWidth = barWidth * healthRatio;
        const healthColor = healthRatio > 0.5 ? '#00ff00' : '#ff0000';
        renderer.drawRect(barX, barY, healthWidth, barHeight, healthColor);
    }
    
    /**
     * 衝突時の処理
     * @param {GameObject} other - 衝突した相手オブジェクト
     */
    onCollision(other) {
        // プレイヤーの弾丸との衝突
        if (other instanceof Bullet && other.isPlayerBullet) {
            this.takeDamage(other.damage);
            other.destroy();
        }
        // プレイヤーとの直接衝突
        else if (other instanceof Player) {
            this.takeDamage(999); // 敵も破壊される
        }
    }
    
    /**
     * 画面下部に到達したかチェック
     * @returns {boolean} 画面下部に到達したかどうか
     */
    hasReachedBottom() {
        return this.y + this.height / 2 >= this.gameEngine.height - 100;
    }
    
    /**
     * 画面外に出た時の処理をオーバーライド
     */
    onOutOfBounds() {
        // 敵は画面外に出ても削除しない（編隊移動で制御）
        // ただし、画面下部を大幅に超えた場合は削除
        if (this.y > this.gameEngine.height + 100) {
            this.destroy();
        }
    }
}