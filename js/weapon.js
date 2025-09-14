/**
 * 武器ベースクラス
 * 各種武器の基本機能を提供
 */
class Weapon {
    constructor(weaponType = 'basic') {
        this.weaponType = weaponType;
        
        // 基本設定
        this.damage = 1;
        this.fireRate = 300; // ミリ秒
        this.bulletSpeed = 400;
        this.bulletCount = 1; // 一度に発射する弾数
        this.spread = 0; // 拡散角度（ラジアン）
        
        // 弾丸の設定
        this.bulletType = 'normal';
        this.bulletColor = '#ffff00';
        this.bulletSize = 4;
        
        // 特殊効果
        this.piercing = false; // 貫通
        this.explosive = false; // 爆発
        this.homing = false; // 追尾
        
        // 武器タイプに応じた設定を適用
        this.setupWeaponType();
        
        console.log(`武器作成: ${this.weaponType}`);
    }
    
    /**
     * 武器タイプに応じた設定
     */
    setupWeaponType() {
        switch (this.weaponType) {
            case 'basic':
                this.setupBasicWeapon();
                break;
            case 'rapid':
                this.setupRapidWeapon();
                break;
            case 'spread':
                this.setupSpreadWeapon();
                break;
            case 'laser':
                this.setupLaserWeapon();
                break;
            default:
                this.setupBasicWeapon();
                break;
        }
    }
    
    /**
     * 基本武器の設定
     */
    setupBasicWeapon() {
        this.damage = 1;
        this.fireRate = 300;
        this.bulletSpeed = 400;
        this.bulletCount = 1;
        this.bulletColor = '#ffff00';
        this.bulletSize = 4;
    }
    
    /**
     * 連射武器の設定
     */
    setupRapidWeapon() {
        this.damage = 1;
        this.fireRate = 180; // 少し遅くして安定性向上
        this.bulletSpeed = 450;
        this.bulletCount = 1;
        this.bulletColor = '#00ffff';
        this.bulletSize = 3;
    }
    
    /**
     * 拡散武器の設定
     */
    setupSpreadWeapon() {
        this.damage = 1;
        this.fireRate = 350; // 少し速くして使いやすく
        this.bulletSpeed = 380; // 少し速くして効果的に
        this.bulletCount = 3; // 3発同時発射
        this.spread = Math.PI / 8; // 22.5度の拡散
        this.bulletColor = '#ff00ff';
        this.bulletSize = 3;
    }
    
    /**
     * レーザー武器の設定
     */
    setupLaserWeapon() {
        this.damage = 2;
        this.fireRate = 400; // 少し速くして使いやすく
        this.bulletSpeed = 550; // 速すぎないように調整
        this.bulletCount = 1;
        this.bulletColor = '#00ff00';
        this.bulletSize = 6;
        this.bulletType = 'laser';
        this.piercing = true; // 貫通効果
    }
    
    /**
     * 弾丸を発射
     * @param {number} x - 発射位置X
     * @param {number} y - 発射位置Y
     * @param {number} targetX - 目標位置X（追尾弾用）
     * @param {number} targetY - 目標位置Y（追尾弾用）
     * @param {boolean} isPlayerBullet - プレイヤーの弾かどうか
     * @returns {Array} 作成された弾丸の配列
     */
    fire(x, y, targetX = null, targetY = null, isPlayerBullet = true) {
        const bullets = [];
        
        if (this.bulletCount === 1) {
            // 単発
            const bullet = this.createBullet(x, y, 0, -this.bulletSpeed, isPlayerBullet);
            bullets.push(bullet);
        } else {
            // 複数発射（拡散）
            for (let i = 0; i < this.bulletCount; i++) {
                const angle = this.calculateSpreadAngle(i);
                const vx = Math.sin(angle) * this.bulletSpeed;
                const vy = -Math.cos(angle) * this.bulletSpeed;
                
                const bullet = this.createBullet(x, y, vx, vy, isPlayerBullet);
                bullets.push(bullet);
            }
        }
        
        return bullets;
    }
    
    /**
     * 拡散角度を計算
     * @param {number} index - 弾丸のインデックス
     * @returns {number} 角度（ラジアン）
     */
    calculateSpreadAngle(index) {
        if (this.bulletCount === 1) return 0;
        
        const totalSpread = this.spread * 2;
        const angleStep = totalSpread / (this.bulletCount - 1);
        return -this.spread + (angleStep * index);
    }
    
    /**
     * 弾丸を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} vx - X方向速度
     * @param {number} vy - Y方向速度
     * @param {boolean} isPlayerBullet - プレイヤーの弾かどうか
     * @returns {Bullet} 作成された弾丸
     */
    createBullet(x, y, vx, vy, isPlayerBullet) {
        let bullet;
        
        if (this.bulletType === 'laser' || this.weaponType === 'laser') {
            bullet = new SpecialBullet(x, y, vx, vy, isPlayerBullet, 'laser');
        } else if (this.weaponType === 'rapid') {
            bullet = new SpecialBullet(x, y, vx, vy, isPlayerBullet, 'rapid');
        } else if (this.weaponType === 'spread') {
            bullet = new SpecialBullet(x, y, vx, vy, isPlayerBullet, 'spread');
        } else {
            bullet = new Bullet(x, y, vx, vy, isPlayerBullet);
        }
        
        // 武器の設定を弾丸に適用
        bullet.damage = this.damage;
        bullet.color = this.bulletColor;
        bullet.width = this.bulletSize;
        bullet.height = this.bulletSize;
        
        // 特殊効果を適用
        if (this.piercing) {
            bullet.piercing = true;
            bullet.maxPierceCount = 3; // 最大3体まで貫通
            bullet.pierceCount = 0;
        }
        
        return bullet;
    }
    
    /**
     * 武器の情報を取得
     * @returns {Object} 武器情報
     */
    getInfo() {
        return {
            type: this.weaponType,
            damage: this.damage,
            fireRate: this.fireRate,
            bulletSpeed: this.bulletSpeed,
            bulletCount: this.bulletCount,
            special: {
                piercing: this.piercing,
                explosive: this.explosive,
                homing: this.homing
            }
        };
    }
    
    /**
     * 武器レベルアップ
     * @param {number} level - 新しいレベル
     */
    upgrade(level) {
        const multiplier = 1 + (level - 1) * 0.15; // レベルごとに15%向上（20%から減少）
        
        this.damage = Math.floor(this.damage * multiplier);
        this.fireRate = Math.max(80, Math.floor(this.fireRate / multiplier)); // 最小発射間隔を80msに制限
        
        // 弾速は最大800ピクセル/秒に制限
        const newBulletSpeed = Math.floor(this.bulletSpeed * multiplier);
        this.bulletSpeed = Math.min(800, newBulletSpeed);
        
        console.log(`武器レベルアップ: ${this.weaponType} レベル${level}`);
        console.log(`ダメージ: ${this.damage}, 発射間隔: ${this.fireRate}ms, 弾速: ${this.bulletSpeed}`);
    }
}

/**
 * 武器管理クラス
 * プレイヤーの現在の武器を管理
 */
class WeaponManager {
    constructor(player) {
        this.player = player;
        this.currentWeapon = new Weapon('basic');
        this.weaponLevel = 1;
        this.maxLevel = 3; // 最大レベルを3に制限してバランス調整
        
        // 武器の進化パス
        this.weaponProgression = ['basic', 'rapid', 'spread', 'laser'];
        this.currentWeaponIndex = 0;
        
        console.log('WeaponManager初期化完了');
    }
    
    /**
     * 武器をアップグレード
     * @param {string} newWeaponType - 新しい武器タイプ（オプション）
     */
    upgradeWeapon(newWeaponType = null) {
        if (newWeaponType) {
            // 特定の武器タイプに変更
            this.currentWeapon = new Weapon(newWeaponType);
            this.currentWeaponIndex = this.weaponProgression.indexOf(newWeaponType);
            if (this.currentWeaponIndex === -1) this.currentWeaponIndex = 0;
        } else {
            // 次の武器に進化
            if (this.currentWeaponIndex < this.weaponProgression.length - 1) {
                this.currentWeaponIndex++;
                const nextWeaponType = this.weaponProgression[this.currentWeaponIndex];
                this.currentWeapon = new Weapon(nextWeaponType);
            } else {
                // 最高武器の場合はレベルアップ
                this.weaponLevel = Math.min(this.maxLevel, this.weaponLevel + 1);
                this.currentWeapon.upgrade(this.weaponLevel);
            }
        }
        
        // UIを更新
        this.updateUI();
        
        console.log(`武器アップグレード: ${this.currentWeapon.weaponType} レベル${this.weaponLevel}`);
    }
    
    /**
     * 弾丸を発射
     * @param {number} x - 発射位置X
     * @param {number} y - 発射位置Y
     * @returns {Array} 作成された弾丸の配列
     */
    fire(x, y) {
        return this.currentWeapon.fire(x, y, null, null, true);
    }
    
    /**
     * 発射レートを取得
     * @returns {number} 発射間隔（ミリ秒）
     */
    getFireRate() {
        return this.currentWeapon.fireRate;
    }
    
    /**
     * 現在の武器情報を取得
     * @returns {Object} 武器情報
     */
    getCurrentWeaponInfo() {
        return {
            ...this.currentWeapon.getInfo(),
            level: this.weaponLevel,
            progression: `${this.currentWeaponIndex + 1}/${this.weaponProgression.length}`
        };
    }
    
    /**
     * UIを更新
     */
    updateUI() {
        const weaponName = this.currentWeapon.weaponType.charAt(0).toUpperCase() + 
                         this.currentWeapon.weaponType.slice(1);
        
        // ゲーム状態管理システムに通知
        if (this.player && this.player.gameEngine) {
            const gameEngine = this.player.gameEngine;
            
            if (gameEngine.gameStateManager) {
                gameEngine.gameStateManager.setWeaponLevel(this.weaponLevel);
            }
            
            // UISystemに通知
            if (gameEngine.uiSystem) {
                gameEngine.uiSystem.onWeaponUpgrade(weaponName, this.weaponLevel);
            }
        }
    }
    
    /**
     * リセット（新しいゲーム開始時）
     */
    reset() {
        this.currentWeapon = new Weapon('basic');
        this.weaponLevel = 1;
        this.currentWeaponIndex = 0;
        this.updateUI();
        console.log('武器システムリセット');
    }
}