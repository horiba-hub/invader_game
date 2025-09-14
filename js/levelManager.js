/**
 * レベル管理クラス
 * 面の進行管理と面クリア条件の判定を行う
 */
class LevelManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // レベル状態
        this.currentLevel = 1;
        this.maxLevel = 2;
        this.levelStartTime = 0;
        this.levelClearTime = 0;
        
        // レベル状態管理
        this.levelState = 'playing'; // 'playing', 'cleared', 'failed'
        this.transitionDelay = 2000; // レベル間の遷移時間（ミリ秒）
        this.transitionTimer = 0;
        
        // レベル設定
        this.levelConfigs = {
            1: {
                name: 'レベル1',
                description: '基本的な敵編隊',
                enemyFormation: {
                    rows: 3,
                    cols: 8,
                    enemyTypes: ['basic', 'basic', 'fast'],
                    spacing: { x: 40, y: 35 },
                    startY: 80,
                    baseSpeed: 50
                },
                shootingConfig: {
                    shootRate: 0.8,
                    maxBullets: 8,
                    aggressiveness: 0.5
                },
                clearCondition: 'destroyAllEnemies',
                timeLimit: null, // 時間制限なし
                bonusPoints: 500
            },
            2: {
                name: 'レベル2',
                description: '強化された敵編隊',
                enemyFormation: {
                    rows: 4,
                    cols: 10,
                    enemyTypes: ['basic', 'fast', 'shooter', 'strong'],
                    spacing: { x: 35, y: 30 },
                    startY: 60,
                    baseSpeed: 60
                },
                shootingConfig: {
                    shootRate: 1.2,
                    maxBullets: 12,
                    aggressiveness: 0.8
                },
                clearCondition: 'destroyAllEnemies',
                timeLimit: null,
                bonusPoints: 1000
            }
        };
        
        // 統計情報
        this.levelStats = {
            enemiesDestroyed: 0,
            bulletsShot: 0,
            accuracy: 0,
            timeElapsed: 0
        };
        
        console.log('LevelManager初期化完了');
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // レベル時間の更新
        this.levelStats.timeElapsed += deltaTime;
        
        // 遷移処理の更新
        if (this.levelState === 'cleared' || this.levelState === 'failed') {
            this.updateTransition(deltaTime);
        } else if (this.levelState === 'playing') {
            this.updateLevel(deltaTime);
        }
    }
    
    /**
     * レベルの更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateLevel(deltaTime) {
        // レベルクリア条件のチェック
        this.checkLevelClearCondition();
        
        // ゲームオーバー条件のチェック
        this.checkGameOverCondition();
        
        // 時間制限のチェック
        this.checkTimeLimit();
    }
    
    /**
     * 遷移処理の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateTransition(deltaTime) {
        this.transitionTimer += deltaTime;
        
        if (this.transitionTimer >= this.transitionDelay) {
            if (this.levelState === 'cleared') {
                this.proceedToNextLevel();
            } else if (this.levelState === 'failed') {
                this.restartLevel();
            }
        }
    }
    
    /**
     * レベルクリア条件のチェック
     */
    checkLevelClearCondition() {
        const config = this.levelConfigs[this.currentLevel];
        if (!config) return;
        
        switch (config.clearCondition) {
            case 'destroyAllEnemies':
                const enemies = this.gameEngine.gameObjects.filter(obj => 
                    obj instanceof Enemy && obj.active
                );
                if (enemies.length === 0) {
                    this.onLevelClear();
                }
                break;
        }
    }
    
    /**
     * ゲームオーバー条件のチェック
     */
    checkGameOverCondition() {
        const player = this.gameEngine.gameObjects.find(obj => 
            obj instanceof Player && obj.active
        );
        
        // プレイヤーが死亡した場合
        if (!player || player.health <= 0) {
            this.onGameOver();
            return;
        }
        
        // 敵が画面下部に到達した場合
        const enemies = this.gameEngine.gameObjects.filter(obj => 
            obj instanceof Enemy && obj.active
        );
        
        const hasReachedBottom = enemies.some(enemy => 
            enemy.y + enemy.height / 2 >= this.gameEngine.height - 100
        );
        
        if (hasReachedBottom) {
            this.onGameOver();
        }
    }
    
    /**
     * 時間制限のチェック
     */
    checkTimeLimit() {
        const config = this.levelConfigs[this.currentLevel];
        if (!config || !config.timeLimit) return;
        
        if (this.levelStats.timeElapsed >= config.timeLimit) {
            this.onGameOver();
        }
    }
    
    /**
     * レベルクリア時の処理
     */
    onLevelClear() {
        if (this.levelState !== 'playing') return;
        
        this.levelState = 'cleared';
        this.transitionTimer = 0;
        this.levelClearTime = this.levelStats.timeElapsed;
        
        // ボーナススコアの計算と加算
        const config = this.levelConfigs[this.currentLevel];
        const bonusScore = this.calculateBonusScore(config);
        this.addScore(bonusScore);
        
        console.log(`レベル${this.currentLevel}クリア！ボーナス: ${bonusScore}点`);
        
        // レベルクリアイベントを発火
        this.gameEngine.onLevelClear?.(this.currentLevel, bonusScore);
    }
    
    /**
     * ゲームオーバー時の処理
     */
    onGameOver() {
        if (this.levelState !== 'playing') return;
        
        this.levelState = 'failed';
        this.transitionTimer = 0;
        
        console.log(`ゲームオーバー - レベル${this.currentLevel}`);
        
        // ゲームオーバーイベントを発火
        this.gameEngine.onGameOver?.(this.currentLevel);
    }
    
    /**
     * 次のレベルに進む
     */
    proceedToNextLevel() {
        if (this.currentLevel >= this.maxLevel) {
            // 全レベルクリア
            this.onGameComplete();
        } else {
            // 次のレベルに進む
            this.currentLevel++;
            this.startLevel(this.currentLevel);
        }
    }
    
    /**
     * レベルを再開始
     */
    restartLevel() {
        this.startLevel(this.currentLevel);
    }
    
    /**
     * 指定レベルを開始
     * @param {number} level - 開始するレベル
     */
    startLevel(level) {
        this.currentLevel = level;
        this.levelState = 'playing';
        this.transitionTimer = 0;
        this.levelStartTime = Date.now();
        
        // 統計情報をリセット
        this.levelStats = {
            enemiesDestroyed: 0,
            bulletsShot: 0,
            accuracy: 0,
            timeElapsed: 0
        };
        
        const config = this.levelConfigs[level];
        if (!config) {
            console.error(`レベル${level}の設定が見つかりません`);
            return;
        }
        
        console.log(`${config.name}開始: ${config.description}`);
        
        // レベル開始イベントを発火
        this.gameEngine.onLevelStart?.(level, config);
        
        // UIの更新
        this.updateLevelUI();
    }
    
    /**
     * ゲーム完全クリア時の処理
     */
    onGameComplete() {
        console.log('ゲーム完全クリア！');
        
        // 完全クリアボーナス
        const completionBonus = 5000;
        this.addScore(completionBonus);
        
        // ゲーム完了イベントを発火
        this.gameEngine.onGameComplete?.(completionBonus);
    }
    
    /**
     * ボーナススコアの計算
     * @param {Object} config - レベル設定
     * @returns {number} ボーナススコア
     */
    calculateBonusScore(config) {
        let bonus = config.bonusPoints || 0;
        
        // 時間ボーナス（速くクリアするほど高い）
        const timeBonus = Math.max(0, 10000 - Math.floor(this.levelClearTime / 100));
        bonus += timeBonus;
        
        // 精度ボーナス
        const accuracyBonus = Math.floor(this.levelStats.accuracy * 1000);
        bonus += accuracyBonus;
        
        return bonus;
    }
    
    /**
     * スコア加算
     * @param {number} points - 加算するスコア
     */
    addScore(points) {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            const currentScore = parseInt(scoreElement.textContent.replace('スコア: ', '')) || 0;
            const newScore = currentScore + points;
            scoreElement.textContent = `スコア: ${newScore}`;
        }
    }
    
    /**
     * 敵撃破時の統計更新
     */
    onEnemyDestroyed() {
        this.levelStats.enemiesDestroyed++;
        this.updateAccuracy();
    }
    
    /**
     * 弾発射時の統計更新
     */
    onBulletShot() {
        this.levelStats.bulletsShot++;
        this.updateAccuracy();
    }
    
    /**
     * 精度の更新
     */
    updateAccuracy() {
        if (this.levelStats.bulletsShot > 0) {
            this.levelStats.accuracy = this.levelStats.enemiesDestroyed / this.levelStats.bulletsShot;
        }
    }
    
    /**
     * レベルUIの更新
     */
    updateLevelUI() {
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = `レベル: ${this.currentLevel}`;
        }
    }
    
    /**
     * 現在のレベル設定を取得
     * @returns {Object} レベル設定
     */
    getCurrentLevelConfig() {
        return this.levelConfigs[this.currentLevel];
    }
    
    /**
     * レベル統計情報を取得
     * @returns {Object} 統計情報
     */
    getLevelStats() {
        return { ...this.levelStats };
    }
    
    /**
     * 描画処理
     * @param {Renderer} renderer - レンダラー
     */
    render(renderer) {
        // レベル遷移中の表示
        if (this.levelState === 'cleared') {
            this.renderLevelClearScreen(renderer);
        } else if (this.levelState === 'failed') {
            this.renderGameOverScreen(renderer);
        }
        
        // デバッグ描画（敵編隊の境界表示）
        if (this.levelState === 'playing' && window.enemyFormation) {
            window.enemyFormation.renderDebug(renderer);
        }
    }
    
    /**
     * レベルクリア画面の描画
     * @param {Renderer} renderer - レンダラー
     */
    renderLevelClearScreen(renderer) {
        const centerX = this.gameEngine.width / 2;
        const centerY = this.gameEngine.height / 2;
        
        // 背景オーバーレイ
        renderer.drawRect(0, 0, this.gameEngine.width, this.gameEngine.height, 'rgba(0, 0, 0, 0.7)');
        
        // レベルクリアテキスト
        renderer.drawTextCentered('LEVEL CLEAR!', centerX, centerY - 60, '#00ff00', '48px Courier New');
        
        // 統計情報
        const config = this.levelConfigs[this.currentLevel];
        const bonusScore = this.calculateBonusScore(config);
        
        renderer.drawTextCentered(`レベル${this.currentLevel}クリア`, centerX, centerY - 10, '#ffffff', '24px Courier New');
        renderer.drawTextCentered(`ボーナス: ${bonusScore}点`, centerX, centerY + 20, '#ffff00', '20px Courier New');
        renderer.drawTextCentered(`精度: ${(this.levelStats.accuracy * 100).toFixed(1)}%`, centerX, centerY + 50, '#ffffff', '16px Courier New');
        
        if (this.currentLevel < this.maxLevel) {
            renderer.drawTextCentered('次のレベルに進みます...', centerX, centerY + 80, '#ffffff', '16px Courier New');
        } else {
            renderer.drawTextCentered('ゲーム完全クリア！', centerX, centerY + 80, '#00ff00', '20px Courier New');
        }
    }
    
    /**
     * ゲームオーバー画面の描画
     * @param {Renderer} renderer - レンダラー
     */
    renderGameOverScreen(renderer) {
        const centerX = this.gameEngine.width / 2;
        const centerY = this.gameEngine.height / 2;
        
        // 背景オーバーレイ
        renderer.drawRect(0, 0, this.gameEngine.width, this.gameEngine.height, 'rgba(0, 0, 0, 0.8)');
        
        // ゲームオーバーテキスト
        renderer.drawTextCentered('GAME OVER', centerX, centerY - 40, '#ff0000', '48px Courier New');
        renderer.drawTextCentered(`レベル${this.currentLevel}で終了`, centerX, centerY + 10, '#ffffff', '20px Courier New');
        renderer.drawTextCentered('リスタートします...', centerX, centerY + 40, '#ffffff', '16px Courier New');
    }
}