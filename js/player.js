/**
 * プレイヤークラス
 * プレイヤー宇宙船の移動と弾発射機能を提供
 */
class Player extends GameObject {
    constructor(x, y) {
        super(x, y);
        
        // プレイヤー固有の設定
        this.width = 20;
        this.height = 20;
        this.color = '#00ff00';
        this.speed = 300; // ピクセル/秒
        
        // 射撃関連
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootCooldownTime = 200; // ミリ秒
        
        // ライフ
        this.maxHealth = 3;
        this.health = this.maxHealth;
        
        // 無敵時間（ダメージ後の一時的な無敵）
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.invulnerabilityDuration = 2000; // 2秒
        
        // 武器システム
        this.weaponManager = null; // 後で初期化
        
        console.log('Player作成完了');
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // 入力処理
        this.handleInput(deltaTime);
        
        // 射撃クールダウンの更新
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
            if (this.shootCooldown <= 0) {
                this.canShoot = true;
            }
        }
        
        // 無敵時間の更新
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // 基本更新処理
        super.update(deltaTime);
    }
    
    /**
     * 入力処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    handleInput(deltaTime) {
        if (!this.gameEngine || !this.gameEngine.inputManager) return;
        
        const input = this.gameEngine.inputManager;
        
        // 移動処理
        this.vx = 0; // 水平速度をリセット
        
        if (input.isLeftPressed()) {
            this.vx = -this.speed;
        }
        if (input.isRightPressed()) {
            this.vx = this.speed;
        }
        
        // 射撃処理
        if (input.isShootPressed() && this.canShoot) {
            this.shoot();
        }
    }
    
    /**
     * 弾発射
     */
    shoot() {
        if (!this.canShoot || !this.gameEngine || !this.weaponManager) return;
        
        // 武器システムを使用して弾丸を発射
        const bullets = this.weaponManager.fire(this.x, this.y - this.height / 2 - 5);
        bullets.forEach(bullet => {
            this.gameEngine.addGameObject(bullet);
        });
        
        // 射撃クールダウン開始（武器の発射レートを使用）
        this.canShoot = false;
        this.shootCooldown = this.weaponManager.getFireRate();
        
        console.log('プレイヤーが弾を発射');
    }
    
    /**
     * ダメージを受ける
     * @param {number} damage - ダメージ量
     */
    takeDamage(damage = 1) {
        if (this.invulnerable || !this.active) return;
        
        this.health -= damage;
        console.log(`プレイヤーがダメージを受けた。残りライフ: ${this.health}`);
        
        // ゲーム状態管理システムに通知
        if (this.gameEngine && this.gameEngine.gameStateManager) {
            this.gameEngine.gameStateManager.loseLife(damage);
            
            // UISystemに通知
            if (this.gameEngine.uiSystem) {
                this.gameEngine.uiSystem.updateLives(this.health, true);
            }
        }
        
        if (this.health <= 0) {
            this.onDeath();
        } else {
            // 無敵時間開始
            this.invulnerable = true;
            this.invulnerabilityTime = this.invulnerabilityDuration;
        }
        
        // UIの更新
        this.updateUI();
    }
    
    /**
     * 死亡時の処理
     */
    onDeath() {
        console.log('プレイヤーが死亡');
        this.active = false;
        // ゲームオーバー処理は後で実装
    }
    
    /**
     * 武器のアップグレード
     * @param {string} weaponType - 新しい武器タイプ（オプション）
     */
    upgradeWeapon(weaponType = null) {
        if (this.weaponManager) {
            this.weaponManager.upgradeWeapon(weaponType);
            console.log('武器アップグレード完了');
        }
    }
    
    /**
     * UIの更新
     */
    updateUI() {
        // DOM要素の更新
        const livesElement = document.getElementById('lives');
        
        if (livesElement) {
            livesElement.textContent = `ライフ: ${this.health}`;
        }
        
        // 武器UIは WeaponManager で管理
    }
    
    /**
     * 境界チェック（プレイヤーは画面外に出ない）
     */
    checkBounds() {
        if (!this.gameEngine) return;
        
        const halfWidth = this.width / 2;
        
        // 左右の境界制限
        if (this.x - halfWidth < 0) {
            this.x = halfWidth;
            this.vx = 0;
        }
        if (this.x + halfWidth > this.gameEngine.width) {
            this.x = this.gameEngine.width - halfWidth;
            this.vx = 0;
        }
        
        // 上下の境界制限（プレイヤーは下部に固定）
        const bottomMargin = 50;
        if (this.y > this.gameEngine.height - bottomMargin) {
            this.y = this.gameEngine.height - bottomMargin;
        }
        if (this.y < this.gameEngine.height - 100) {
            this.y = this.gameEngine.height - 100;
        }
    }
    
    /**
     * 画面外に出た時の処理（プレイヤーは削除しない）
     */
    onOutOfBounds() {
        // プレイヤーは削除しない
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} ctx - Canvas描画コンテキスト
     */
    render(ctx) {
        if (!this.visible || !this.gameEngine) return;
        
        // 無敵時間中は点滅
        if (this.invulnerable) {
            const blinkRate = 100; // ミリ秒
            const shouldShow = Math.floor(this.invulnerabilityTime / blinkRate) % 2 === 0;
            if (!shouldShow) return;
        }
        
        // プレイヤー宇宙船の描画
        this.gameEngine.renderer.drawPlayer(this.x, this.y, Math.max(this.width, this.height), this.color);
    }
    
    /**
     * 衝突時の処理
     * @param {GameObject} other - 衝突した相手オブジェクト
     */
    onCollision(other) {
        // 武器アイテムとの衝突（最優先で処理）
        if (other instanceof WeaponPickup && other.active) {
            if (this.weaponManager) {
                this.upgradeWeapon(); // 武器タイプは自動進化
            }
            other.destroy();
            return; // 他の処理をスキップ
        }
        
        // 敵の弾丸との衝突
        if (other instanceof Bullet && !other.isPlayerBullet) {
            this.takeDamage(1);
            other.destroy();
        }
        // 敵との直接衝突
        else if (other instanceof Enemy) {
            this.takeDamage(1);
        }
    }
    
    /**
     * 武器システムの初期化
     */
    initWeaponSystem() {
        this.weaponManager = new WeaponManager(this);
    }
    
    /**
     * リセット（新しいゲーム開始時）
     */
    reset() {
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.active = true;
        this.shouldDestroy = false;
        this.canShoot = true;
        this.shootCooldown = 0;
        
        // 武器システムのリセット
        if (this.weaponManager) {
            this.weaponManager.reset();
        }
        
        // 初期位置に戻す
        this.setPosition(this.gameEngine.width / 2, this.gameEngine.height - 50);
        this.setVelocity(0, 0);
        
        this.updateUI();
        console.log('プレイヤーリセット完了');
    }
}