/**
 * ゲーム状態管理クラス
 * スコア、ライフ、レベルなどのゲーム状態を管理
 */
class GameStateManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // ゲーム状態
        this.gameState = {
            score: 0,
            lives: 3,
            level: 1,
            weaponLevel: 1,
            gameStatus: 'menu' // 'menu', 'playing', 'paused', 'gameOver', 'victory'
        };
        
        // 統計情報
        this.gameStats = {
            totalEnemiesDestroyed: 0,
            totalBulletsShot: 0,
            totalAccuracy: 0,
            totalPlayTime: 0,
            levelsCompleted: 0,
            weaponsCollected: 0,
            highScore: this.loadHighScore()
        };
        
        // 状態変更リスナー
        this.stateChangeListeners = [];
        
        // 自動保存設定
        this.autoSaveInterval = 5000; // 5秒ごと
        this.lastSaveTime = 0;
        
        console.log('GameStateManager初期化完了');
        this.initializeGame();
    }
    
    /**
     * ゲームの初期化
     */
    initializeGame() {
        this.resetGameState();
        this.updateAllUI();
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // プレイ時間の更新
        if (this.gameState.gameStatus === 'playing') {
            this.gameStats.totalPlayTime += deltaTime;
        }
        
        // 自動保存
        this.lastSaveTime += deltaTime;
        if (this.lastSaveTime >= this.autoSaveInterval) {
            this.autoSave();
            this.lastSaveTime = 0;
        }
    }
    
    /**
     * スコアを加算
     * @param {number} points - 加算するスコア
     */
    addScore(points) {
        this.gameState.score += points;
        this.updateScoreUI();
        this.notifyStateChange('score', this.gameState.score);
        
        // ハイスコア更新チェック
        if (this.gameState.score > this.gameStats.highScore) {
            this.gameStats.highScore = this.gameState.score;
            this.saveHighScore();
        }
    }
    
    /**
     * ライフを減らす
     * @param {number} amount - 減らすライフ数
     */
    loseLife(amount = 1) {
        this.gameState.lives = Math.max(0, this.gameState.lives - amount);
        this.updateLivesUI();
        this.notifyStateChange('lives', this.gameState.lives);
        
        if (this.gameState.lives <= 0) {
            this.setGameStatus('gameOver');
        }
    }
    
    /**
     * ライフを増やす
     * @param {number} amount - 増やすライフ数
     */
    gainLife(amount = 1) {
        this.gameState.lives += amount;
        this.updateLivesUI();
        this.notifyStateChange('lives', this.gameState.lives);
    }
    
    /**
     * レベルを設定
     * @param {number} level - 新しいレベル
     */
    setLevel(level) {
        this.gameState.level = level;
        this.updateLevelUI();
        this.notifyStateChange('level', level);
    }
    
    /**
     * 武器レベルを設定
     * @param {number} weaponLevel - 新しい武器レベル
     */
    setWeaponLevel(weaponLevel) {
        this.gameState.weaponLevel = weaponLevel;
        this.updateWeaponUI();
        this.notifyStateChange('weaponLevel', weaponLevel);
    }
    
    /**
     * ゲーム状態を設定
     * @param {string} status - 新しいゲーム状態
     */
    setGameStatus(status) {
        const oldStatus = this.gameState.gameStatus;
        this.gameState.gameStatus = status;
        this.notifyStateChange('gameStatus', status);
        
        // 状態変更時の処理
        this.onGameStatusChange(oldStatus, status);
    }
    
    /**
     * ゲーム状態変更時の処理
     * @param {string} oldStatus - 前の状態
     * @param {string} newStatus - 新しい状態
     */
    onGameStatusChange(oldStatus, newStatus) {
        console.log(`ゲーム状態変更: ${oldStatus} → ${newStatus}`);
        
        switch (newStatus) {
            case 'playing':
                this.onGameStart();
                break;
            case 'paused':
                this.onGamePause();
                break;
            case 'gameOver':
                this.onGameOver();
                break;
            case 'victory':
                this.onGameVictory();
                break;
        }
    }
    
    /**
     * ゲーム開始時の処理
     */
    onGameStart() {
        console.log('ゲーム開始');
    }
    
    /**
     * ゲーム一時停止時の処理
     */
    onGamePause() {
        console.log('ゲーム一時停止');
    }
    
    /**
     * ゲームオーバー時の処理
     */
    onGameOver() {
        console.log('ゲームオーバー');
        this.gameStats.levelsCompleted = this.gameState.level - 1;
        this.saveGameStats();
    }
    
    /**
     * ゲーム勝利時の処理
     */
    onGameVictory() {
        console.log('ゲーム勝利');
        this.gameStats.levelsCompleted = this.gameState.level;
        this.saveGameStats();
    }
    
    /**
     * 敵撃破時の統計更新
     */
    onEnemyDestroyed() {
        this.gameStats.totalEnemiesDestroyed++;
        this.updateAccuracy();
    }
    
    /**
     * 弾発射時の統計更新
     */
    onBulletShot() {
        this.gameStats.totalBulletsShot++;
        this.updateAccuracy();
    }
    
    /**
     * 武器取得時の統計更新
     */
    onWeaponCollected() {
        this.gameStats.weaponsCollected++;
    }
    
    /**
     * 精度の更新
     */
    updateAccuracy() {
        if (this.gameStats.totalBulletsShot > 0) {
            this.gameStats.totalAccuracy = this.gameStats.totalEnemiesDestroyed / this.gameStats.totalBulletsShot;
        }
    }
    
    /**
     * ゲーム状態をリセット
     */
    resetGameState() {
        this.gameState = {
            score: 0,
            lives: 3,
            level: 1,
            weaponLevel: 1,
            gameStatus: 'menu'
        };
        
        // 統計情報の一部をリセット
        this.gameStats.totalEnemiesDestroyed = 0;
        this.gameStats.totalBulletsShot = 0;
        this.gameStats.totalAccuracy = 0;
        this.gameStats.totalPlayTime = 0;
        this.gameStats.levelsCompleted = 0;
        this.gameStats.weaponsCollected = 0;
        
        this.updateAllUI();
    }
    
    /**
     * 全UIを更新
     */
    updateAllUI() {
        this.updateScoreUI();
        this.updateLivesUI();
        this.updateLevelUI();
        this.updateWeaponUI();
    }
    
    /**
     * スコアUIを更新
     */
    updateScoreUI() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `スコア: ${this.gameState.score}`;
        }
    }
    
    /**
     * ライフUIを更新
     */
    updateLivesUI() {
        const livesElement = document.getElementById('lives');
        if (livesElement) {
            livesElement.textContent = `ライフ: ${this.gameState.lives}`;
        }
    }
    
    /**
     * レベルUIを更新
     */
    updateLevelUI() {
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = `レベル: ${this.gameState.level}`;
        }
    }
    
    /**
     * 武器UIを更新
     */
    updateWeaponUI() {
        const weaponElement = document.getElementById('weapon');
        if (weaponElement) {
            const weaponNames = ['Basic', 'Rapid', 'Spread', 'Laser'];
            const weaponName = weaponNames[this.gameState.weaponLevel - 1] || 'Unknown';
            weaponElement.textContent = `武器: ${weaponName}`;
        }
    }
    
    /**
     * 状態変更リスナーを追加
     * @param {Function} listener - リスナー関数
     */
    addStateChangeListener(listener) {
        this.stateChangeListeners.push(listener);
    }
    
    /**
     * 状態変更リスナーを削除
     * @param {Function} listener - リスナー関数
     */
    removeStateChangeListener(listener) {
        const index = this.stateChangeListeners.indexOf(listener);
        if (index > -1) {
            this.stateChangeListeners.splice(index, 1);
        }
    }
    
    /**
     * 状態変更を通知
     * @param {string} property - 変更されたプロパティ
     * @param {*} value - 新しい値
     */
    notifyStateChange(property, value) {
        this.stateChangeListeners.forEach(listener => {
            try {
                listener(property, value, this.gameState);
            } catch (error) {
                console.error('状態変更リスナーエラー:', error);
            }
        });
    }
    
    /**
     * ゲーム状態を保存
     */
    saveGameState() {
        try {
            const saveData = {
                gameState: this.gameState,
                gameStats: this.gameStats,
                timestamp: Date.now()
            };
            localStorage.setItem('invaderGame_saveData', JSON.stringify(saveData));
        } catch (error) {
            console.error('ゲーム状態の保存に失敗:', error);
        }
    }
    
    /**
     * ゲーム状態を読み込み
     * @returns {boolean} 読み込み成功かどうか
     */
    loadGameState() {
        try {
            const saveData = localStorage.getItem('invaderGame_saveData');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.gameState = { ...this.gameState, ...data.gameState };
                this.gameStats = { ...this.gameStats, ...data.gameStats };
                this.updateAllUI();
                return true;
            }
        } catch (error) {
            console.error('ゲーム状態の読み込みに失敗:', error);
        }
        return false;
    }
    
    /**
     * ハイスコアを保存
     */
    saveHighScore() {
        try {
            localStorage.setItem('invaderGame_highScore', this.gameStats.highScore.toString());
        } catch (error) {
            console.error('ハイスコアの保存に失敗:', error);
        }
    }
    
    /**
     * ハイスコアを読み込み
     * @returns {number} ハイスコア
     */
    loadHighScore() {
        try {
            const highScore = localStorage.getItem('invaderGame_highScore');
            return highScore ? parseInt(highScore) : 0;
        } catch (error) {
            console.error('ハイスコアの読み込みに失敗:', error);
            return 0;
        }
    }
    
    /**
     * ゲーム統計を保存
     */
    saveGameStats() {
        try {
            localStorage.setItem('invaderGame_stats', JSON.stringify(this.gameStats));
        } catch (error) {
            console.error('ゲーム統計の保存に失敗:', error);
        }
    }
    
    /**
     * 自動保存
     */
    autoSave() {
        if (this.gameState.gameStatus === 'playing') {
            this.saveGameState();
        }
    }
    
    /**
     * 現在のゲーム状態を取得
     * @returns {Object} ゲーム状態
     */
    getGameState() {
        return { ...this.gameState };
    }
    
    /**
     * ゲーム統計を取得
     * @returns {Object} ゲーム統計
     */
    getGameStats() {
        return { ...this.gameStats };
    }
}