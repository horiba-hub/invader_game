/**
 * 敵の射撃システム
 * 敵の弾発射頻度と戦略を管理
 */
class EnemyShootingSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 射撃設定
        this.globalShootRate = 1.0; // グローバル射撃頻度倍率
        this.maxSimultaneousBullets = 10; // 同時に存在できる敵弾の最大数
        this.currentBulletCount = 0;
        
        // レベル別設定
        this.levelSettings = {
            1: {
                shootRate: 0.8,
                maxBullets: 8,
                aggressiveness: 0.5
            },
            2: {
                shootRate: 1.2,
                maxBullets: 12,
                aggressiveness: 0.8
            }
        };
        
        this.currentLevel = 1;
        
        console.log('EnemyShootingSystem初期化完了');
    }
    
    /**
     * レベル設定の更新
     * @param {number} level - 現在のレベル
     * @param {Object} levelConfig - レベル設定（オプション）
     */
    setLevel(level, levelConfig = null) {
        this.currentLevel = level;
        
        // レベル設定を使用（提供されていない場合はデフォルト）
        const settings = levelConfig?.shootingConfig || this.levelSettings[level] || this.levelSettings[2];
        
        this.globalShootRate = settings.shootRate;
        this.maxSimultaneousBullets = settings.maxBullets;
        
        // レベルに応じた追加スケーリング
        const scalingFactor = 1 + (level - 1) * 0.15; // レベルごとに15%強化
        this.globalShootRate *= scalingFactor;
        this.maxSimultaneousBullets = Math.floor(this.maxSimultaneousBullets * scalingFactor);
        
        console.log(`射撃システムレベル更新: ${level}`);
        console.log(`射撃頻度: ${this.globalShootRate.toFixed(2)}, 最大弾数: ${this.maxSimultaneousBullets}`);
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 現在の敵弾数をカウント
        this.updateBulletCount();
        
        // 敵の射撃判定を更新
        this.updateEnemyShooting(deltaTime);
    }
    
    /**
     * 現在の敵弾数を更新
     */
    updateBulletCount() {
        this.currentBulletCount = this.gameEngine.gameObjects.filter(obj => 
            obj instanceof Bullet && !obj.isPlayerBullet
        ).length;
    }
    
    /**
     * 敵の射撃判定を更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateEnemyShooting(deltaTime) {
        const enemies = this.gameEngine.gameObjects.filter(obj => obj instanceof Enemy);
        
        if (enemies.length === 0) return;
        
        // 弾数制限チェック
        if (this.currentBulletCount >= this.maxSimultaneousBullets) {
            return;
        }
        
        // 戦略的射撃判定
        this.strategicShooting(enemies, deltaTime);
    }
    
    /**
     * 戦略的射撃判定
     * @param {Array} enemies - 敵の配列
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    strategicShooting(enemies, deltaTime) {
        const player = this.gameEngine.gameObjects.find(obj => obj instanceof Player);
        if (!player) return;
        
        // プレイヤーに最も近い敵を優先的に射撃させる
        const enemiesWithDistance = enemies.map(enemy => ({
            enemy: enemy,
            distance: Math.abs(enemy.x - player.x),
            canShoot: enemy.canShoot && enemy.active
        }));
        
        // 距離でソート
        enemiesWithDistance.sort((a, b) => a.distance - b.distance);
        
        // 上位の敵に射撃チャンスを与える
        const maxShooters = Math.min(3, enemiesWithDistance.length);
        for (let i = 0; i < maxShooters; i++) {
            const enemyData = enemiesWithDistance[i];
            if (enemyData.canShoot) {
                this.tryEnemyShoot(enemyData.enemy, player);
            }
        }
    }
    
    /**
     * 敵の射撃試行
     * @param {Enemy} enemy - 射撃する敵
     * @param {Player} player - プレイヤー
     */
    tryEnemyShoot(enemy, player) {
        // 基本射撃確率を計算
        let shootChance = enemy.shootProbability * this.globalShootRate;
        
        // プレイヤーとの距離に応じて射撃確率を調整
        const distance = Math.abs(enemy.x - player.x);
        const maxDistance = this.gameEngine.width;
        const distanceFactor = 1 - (distance / maxDistance);
        shootChance *= (0.5 + distanceFactor * 0.5);
        
        // 敵のタイプに応じた調整
        switch (enemy.enemyType) {
            case 'shooter':
                shootChance *= 2.0;
                break;
            case 'fast':
                shootChance *= 1.5;
                break;
            case 'strong':
                shootChance *= 0.8;
                break;
        }
        
        // 射撃判定
        if (Math.random() < shootChance) {
            this.executeEnemyShoot(enemy, player);
        }
    }
    
    /**
     * 敵の射撃実行
     * @param {Enemy} enemy - 射撃する敵
     * @param {Player} player - プレイヤー
     */
    executeEnemyShoot(enemy, player) {
        if (this.currentBulletCount >= this.maxSimultaneousBullets) {
            return;
        }
        
        // 射撃パターンの決定
        const shootPattern = this.getShootPattern(enemy);
        
        switch (shootPattern) {
            case 'straight':
                this.shootStraight(enemy);
                break;
            case 'aimed':
                this.shootAimed(enemy, player);
                break;
            case 'spread':
                this.shootSpread(enemy);
                break;
            default:
                this.shootStraight(enemy);
                break;
        }
    }
    
    /**
     * 射撃パターンの決定
     * @param {Enemy} enemy - 敵
     * @returns {string} 射撃パターン
     */
    getShootPattern(enemy) {
        switch (enemy.enemyType) {
            case 'shooter':
                return Math.random() < 0.7 ? 'aimed' : 'straight';
            case 'fast':
                return 'straight';
            case 'strong':
                return Math.random() < 0.5 ? 'spread' : 'straight';
            default:
                return 'straight';
        }
    }
    
    /**
     * 直線射撃
     * @param {Enemy} enemy - 射撃する敵
     */
    shootStraight(enemy) {
        const bullet = new Bullet(
            enemy.x,
            enemy.y + enemy.height / 2 + 5,
            0,
            200,
            false
        );
        this.gameEngine.addGameObject(bullet);
        this.setBulletCooldown(enemy);
    }
    
    /**
     * 狙い撃ち
     * @param {Enemy} enemy - 射撃する敵
     * @param {Player} player - プレイヤー
     */
    shootAimed(enemy, player) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const speed = 250;
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        
        const bullet = new Bullet(
            enemy.x,
            enemy.y + enemy.height / 2 + 5,
            vx,
            vy,
            false
        );
        bullet.color = '#ff8800'; // 狙い撃ち弾は橙色
        this.gameEngine.addGameObject(bullet);
        this.setBulletCooldown(enemy);
    }
    
    /**
     * 拡散射撃
     * @param {Enemy} enemy - 射撃する敵
     */
    shootSpread(enemy) {
        const angles = [-0.3, 0, 0.3]; // 3方向に拡散
        const speed = 180;
        
        angles.forEach(angle => {
            const vx = Math.sin(angle) * speed;
            const vy = Math.cos(angle) * speed;
            
            const bullet = new Bullet(
                enemy.x,
                enemy.y + enemy.height / 2 + 5,
                vx,
                vy,
                false
            );
            bullet.color = '#ff00ff'; // 拡散弾は紫色
            this.gameEngine.addGameObject(bullet);
        });
        
        this.setBulletCooldown(enemy, 1.5); // 拡散射撃は長めのクールダウン
    }
    
    /**
     * 敵の射撃クールダウンを設定
     * @param {Enemy} enemy - 敵
     * @param {number} multiplier - クールダウン倍率
     */
    setBulletCooldown(enemy, multiplier = 1.0) {
        enemy.canShoot = false;
        enemy.shootCooldown = enemy.shootCooldownTime * multiplier;
    }
    
    /**
     * 射撃頻度の調整
     * @param {number} rate - 新しい射撃頻度倍率
     */
    setGlobalShootRate(rate) {
        this.globalShootRate = rate;
        console.log(`グローバル射撃頻度を${rate}に設定`);
    }
    
    /**
     * デバッグ情報の取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            currentBulletCount: this.currentBulletCount,
            maxBullets: this.maxSimultaneousBullets,
            shootRate: this.globalShootRate,
            level: this.currentLevel
        };
    }
}