/**
 * シーン管理クラス
 * スタート画面、ゲーム画面、ゲームオーバー画面の管理を行う
 */
class SceneManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // シーン定義
        this.scenes = {
            START: 'start',
            GAME: 'game',
            PAUSE: 'pause',
            LEVEL_CLEAR: 'levelClear',
            GAME_OVER: 'gameOver',
            VICTORY: 'victory'
        };
        
        // 現在のシーン
        this.currentScene = this.scenes.START;
        this.previousScene = null;
        
        // シーン遷移
        this.isTransitioning = false;
        this.transitionDuration = 500; // ミリ秒
        this.transitionTimer = 0;
        this.transitionType = 'fade'; // 'fade', 'slide', 'none'
        
        // シーンデータ
        this.sceneData = {
            start: {
                title: 'インベーダーゲーム',
                subtitle: 'Press ENTER to Start',
                instructions: [
                    '矢印キー: 移動',
                    'スペース: 射撃',
                    'P: 一時停止'
                ]
            },
            gameOver: {
                title: 'GAME OVER',
                subtitle: 'Press ENTER to Restart',
                showStats: true
            },
            victory: {
                title: 'CONGRATULATIONS!',
                subtitle: 'You Win!',
                showStats: true
            },
            levelClear: {
                title: 'LEVEL CLEAR',
                subtitle: 'Get Ready for Next Level',
                showProgress: true
            }
        };
        
        console.log('SceneManager初期化完了');
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 遷移中の処理
        if (this.isTransitioning) {
            this.updateTransition(deltaTime);
        } else {
            // 現在のシーンの更新
            this.updateCurrentScene(deltaTime);
        }
        
        // 入力処理
        this.handleSceneInput();
    }
    
    /**
     * 遷移の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateTransition(deltaTime) {
        this.transitionTimer += deltaTime;
        
        if (this.transitionTimer >= this.transitionDuration) {
            this.completeTransition();
        }
    }
    
    /**
     * 現在のシーンの更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateCurrentScene(deltaTime) {
        switch (this.currentScene) {
            case this.scenes.START:
                this.updateStartScene(deltaTime);
                break;
            case this.scenes.GAME:
                this.updateGameScene(deltaTime);
                break;
            case this.scenes.PAUSE:
                this.updatePauseScene(deltaTime);
                break;
            case this.scenes.LEVEL_CLEAR:
                this.updateLevelClearScene(deltaTime);
                break;
            case this.scenes.GAME_OVER:
                this.updateGameOverScene(deltaTime);
                break;
            case this.scenes.VICTORY:
                this.updateVictoryScene(deltaTime);
                break;
        }
    }
    
    /**
     * スタートシーンの更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateStartScene(deltaTime) {
        // アニメーション効果などを追加可能
    }
    
    /**
     * ゲームシーンの更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateGameScene(deltaTime) {
        // ゲームロジックは他のシステムで処理
    }
    
    /**
     * 一時停止シーンの更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updatePauseScene(deltaTime) {
        // 一時停止中の処理
    }
    
    /**
     * レベルクリアシーンの更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateLevelClearScene(deltaTime) {
        // 自動遷移タイマーなどを追加可能
    }
    
    /**
     * ゲームオーバーシーンの更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateGameOverScene(deltaTime) {
        // ゲームオーバー演出
    }
    
    /**
     * 勝利シーンの更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateVictoryScene(deltaTime) {
        // 勝利演出
    }
    
    /**
     * シーン入力処理
     */
    handleSceneInput() {
        if (!this.gameEngine.inputManager) return;
        
        const input = this.gameEngine.inputManager;
        
        switch (this.currentScene) {
            case this.scenes.START:
                if (input.isEnterPressed()) {
                    this.startGame();
                }
                break;
                
            case this.scenes.GAME:
                if (input.isPausePressed()) {
                    this.pauseGame();
                }
                break;
                
            case this.scenes.PAUSE:
                if (input.isPausePressed() || input.isEnterPressed()) {
                    this.resumeGame();
                }
                if (input.isEscapePressed()) {
                    this.goToStartScreen();
                }
                break;
                
            case this.scenes.GAME_OVER:
                if (input.isEnterPressed()) {
                    this.restartGame();
                }
                if (input.isEscapePressed()) {
                    this.goToStartScreen();
                }
                break;
                
            case this.scenes.VICTORY:
                if (input.isEnterPressed() || input.isEscapePressed()) {
                    this.goToStartScreen();
                }
                break;
        }
    }
    
    /**
     * シーンを変更
     * @param {string} newScene - 新しいシーン
     * @param {string} transitionType - 遷移タイプ
     */
    changeScene(newScene, transitionType = 'fade') {
        if (this.isTransitioning || this.currentScene === newScene) return;
        
        this.previousScene = this.currentScene;
        this.currentScene = newScene;
        this.transitionType = transitionType;
        this.isTransitioning = true;
        this.transitionTimer = 0;
        
        console.log(`シーン変更: ${this.previousScene} → ${newScene}`);
        
        // シーン変更時の処理
        this.onSceneChange(this.previousScene, newScene);
    }
    
    /**
     * 遷移完了
     */
    completeTransition() {
        this.isTransitioning = false;
        this.transitionTimer = 0;
        
        // 新しいシーンの初期化
        this.initializeScene(this.currentScene);
    }
    
    /**
     * シーンの初期化
     * @param {string} scene - 初期化するシーン
     */
    initializeScene(scene) {
        switch (scene) {
            case this.scenes.START:
                this.initializeStartScene();
                break;
            case this.scenes.GAME:
                this.initializeGameScene();
                break;
            case this.scenes.PAUSE:
                this.initializePauseScene();
                break;
            case this.scenes.LEVEL_CLEAR:
                this.initializeLevelClearScene();
                break;
            case this.scenes.GAME_OVER:
                this.initializeGameOverScene();
                break;
            case this.scenes.VICTORY:
                this.initializeVictoryScene();
                break;
        }
    }
    
    /**
     * スタートシーンの初期化
     */
    initializeStartScene() {
        // ゲーム状態をリセット
        if (this.gameEngine.gameStateManager) {
            this.gameEngine.gameStateManager.resetGameState();
        }
    }
    
    /**
     * ゲームシーンの初期化
     */
    initializeGameScene() {
        // ゲーム開始
        if (this.gameEngine.gameStateManager) {
            this.gameEngine.gameStateManager.setGameStatus('playing');
        }
        
        // ゲームを再開始
        this.gameEngine.restartGame();
    }
    
    /**
     * 一時停止シーンの初期化
     */
    initializePauseScene() {
        if (this.gameEngine.gameStateManager) {
            this.gameEngine.gameStateManager.setGameStatus('paused');
        }
    }
    
    /**
     * レベルクリアシーンの初期化
     */
    initializeLevelClearScene() {
        // レベルクリア処理
    }
    
    /**
     * ゲームオーバーシーンの初期化
     */
    initializeGameOverScene() {
        if (this.gameEngine.gameStateManager) {
            this.gameEngine.gameStateManager.setGameStatus('gameOver');
        }
    }
    
    /**
     * 勝利シーンの初期化
     */
    initializeVictoryScene() {
        if (this.gameEngine.gameStateManager) {
            this.gameEngine.gameStateManager.setGameStatus('victory');
        }
    }
    
    /**
     * シーン変更時の処理
     * @param {string} oldScene - 前のシーン
     * @param {string} newScene - 新しいシーン
     */
    onSceneChange(oldScene, newScene) {
        // UIの表示/非表示制御
        if (this.gameEngine.uiSystem) {
            const showUI = newScene === this.scenes.GAME || newScene === this.scenes.PAUSE;
            this.gameEngine.uiSystem.setVisible(showUI);
        }
    }
    
    /**
     * ゲーム開始
     */
    startGame() {
        this.changeScene(this.scenes.GAME);
    }
    
    /**
     * ゲーム一時停止
     */
    pauseGame() {
        this.changeScene(this.scenes.PAUSE);
    }
    
    /**
     * ゲーム再開
     */
    resumeGame() {
        this.changeScene(this.scenes.GAME);
    }
    
    /**
     * ゲーム再開始
     */
    restartGame() {
        this.changeScene(this.scenes.GAME);
    }
    
    /**
     * スタート画面に戻る
     */
    goToStartScreen() {
        this.changeScene(this.scenes.START);
    }
    
    /**
     * レベルクリア画面に移行
     */
    showLevelClear() {
        this.changeScene(this.scenes.LEVEL_CLEAR);
    }
    
    /**
     * ゲームオーバー画面に移行
     */
    showGameOver() {
        this.changeScene(this.scenes.GAME_OVER);
    }
    
    /**
     * 勝利画面に移行
     */
    showVictory() {
        this.changeScene(this.scenes.VICTORY);
    }
    
    /**
     * 描画処理
     * @param {Renderer} renderer - レンダラー
     */
    render(renderer) {
        // 遷移エフェクトの描画
        if (this.isTransitioning) {
            this.renderTransition(renderer);
        }
        
        // 現在のシーンの描画
        this.renderCurrentScene(renderer);
    }
    
    /**
     * 現在のシーンの描画
     * @param {Renderer} renderer - レンダラー
     */
    renderCurrentScene(renderer) {
        switch (this.currentScene) {
            case this.scenes.START:
                this.renderStartScene(renderer);
                break;
            case this.scenes.PAUSE:
                this.renderPauseScene(renderer);
                break;
            case this.scenes.LEVEL_CLEAR:
                this.renderLevelClearScene(renderer);
                break;
            case this.scenes.GAME_OVER:
                this.renderGameOverScene(renderer);
                break;
            case this.scenes.VICTORY:
                this.renderVictoryScene(renderer);
                break;
        }
    }
    
    /**
     * スタートシーンの描画
     * @param {Renderer} renderer - レンダラー
     */
    renderStartScene(renderer) {
        const centerX = this.gameEngine.width / 2;
        const centerY = this.gameEngine.height / 2;
        
        // 背景
        renderer.drawRect(0, 0, this.gameEngine.width, this.gameEngine.height, '#000011');
        
        // タイトル
        renderer.drawTextCentered(
            this.sceneData.start.title,
            centerX, centerY - 100,
            '#00ff00', '48px Courier New'
        );
        
        // サブタイトル（点滅）
        const blinkRate = 1000;
        const shouldShow = Math.floor(Date.now() / blinkRate) % 2 === 0;
        if (shouldShow) {
            renderer.drawTextCentered(
                this.sceneData.start.subtitle,
                centerX, centerY - 20,
                '#ffffff', '24px Courier New'
            );
        }
        
        // 操作説明
        this.sceneData.start.instructions.forEach((instruction, index) => {
            renderer.drawTextCentered(
                instruction,
                centerX, centerY + 40 + (index * 25),
                '#aaaaaa', '16px Courier New'
            );
        });
        
        // ハイスコア表示
        if (this.gameEngine.gameStateManager) {
            const highScore = this.gameEngine.gameStateManager.getGameStats().highScore;
            if (highScore > 0) {
                renderer.drawTextCentered(
                    `ハイスコア: ${highScore.toLocaleString()}`,
                    centerX, centerY + 150,
                    '#ffff00', '20px Courier New'
                );
            }
        }
    }
    
    /**
     * 一時停止シーンの描画
     * @param {Renderer} renderer - レンダラー
     */
    renderPauseScene(renderer) {
        const centerX = this.gameEngine.width / 2;
        const centerY = this.gameEngine.height / 2;
        
        // 半透明オーバーレイ
        renderer.drawRect(0, 0, this.gameEngine.width, this.gameEngine.height, 'rgba(0, 0, 0, 0.7)');
        
        // 一時停止テキスト
        renderer.drawTextCentered('PAUSED', centerX, centerY - 40, '#ffffff', '48px Courier New');
        
        // 操作説明
        renderer.drawTextCentered('P または ENTER: 再開', centerX, centerY + 20, '#ffffff', '20px Courier New');
        renderer.drawTextCentered('ESC: タイトルに戻る', centerX, centerY + 50, '#ffffff', '20px Courier New');
    }
    
    /**
     * レベルクリアシーンの描画
     * @param {Renderer} renderer - レンダラー
     */
    renderLevelClearScene(renderer) {
        const centerX = this.gameEngine.width / 2;
        const centerY = this.gameEngine.height / 2;
        
        // 背景オーバーレイ
        renderer.drawRect(0, 0, this.gameEngine.width, this.gameEngine.height, 'rgba(0, 50, 0, 0.8)');
        
        // レベルクリアテキスト
        renderer.drawTextCentered('LEVEL CLEAR!', centerX, centerY - 60, '#00ff00', '48px Courier New');
        
        // 次のレベル情報
        if (this.gameEngine.levelManager) {
            const currentLevel = this.gameEngine.levelManager.currentLevel;
            renderer.drawTextCentered(
                `レベル${currentLevel + 1}に進みます...`,
                centerX, centerY + 20,
                '#ffffff', '24px Courier New'
            );
        }
    }
    
    /**
     * ゲームオーバーシーンの描画
     * @param {Renderer} renderer - レンダラー
     */
    renderGameOverScene(renderer) {
        const centerX = this.gameEngine.width / 2;
        const centerY = this.gameEngine.height / 2;
        
        // 背景オーバーレイ
        renderer.drawRect(0, 0, this.gameEngine.width, this.gameEngine.height, 'rgba(50, 0, 0, 0.8)');
        
        // ゲームオーバーテキスト
        renderer.drawTextCentered('GAME OVER', centerX, centerY - 80, '#ff0000', '48px Courier New');
        
        // 統計情報
        if (this.gameEngine.gameStateManager) {
            const gameState = this.gameEngine.gameStateManager.getGameState();
            const gameStats = this.gameEngine.gameStateManager.getGameStats();
            
            renderer.drawTextCentered(
                `最終スコア: ${gameState.score.toLocaleString()}`,
                centerX, centerY - 20,
                '#ffffff', '24px Courier New'
            );
            
            renderer.drawTextCentered(
                `到達レベル: ${gameState.level}`,
                centerX, centerY + 10,
                '#ffffff', '20px Courier New'
            );
            
            if (gameStats.totalAccuracy > 0) {
                renderer.drawTextCentered(
                    `命中率: ${(gameStats.totalAccuracy * 100).toFixed(1)}%`,
                    centerX, centerY + 40,
                    '#ffffff', '20px Courier New'
                );
            }
        }
        
        // 操作説明
        renderer.drawTextCentered('ENTER: リスタート', centerX, centerY + 80, '#ffffff', '16px Courier New');
        renderer.drawTextCentered('ESC: タイトルに戻る', centerX, centerY + 105, '#ffffff', '16px Courier New');
    }
    
    /**
     * 勝利シーンの描画
     * @param {Renderer} renderer - レンダラー
     */
    renderVictoryScene(renderer) {
        const centerX = this.gameEngine.width / 2;
        const centerY = this.gameEngine.height / 2;
        
        // 背景オーバーレイ
        renderer.drawRect(0, 0, this.gameEngine.width, this.gameEngine.height, 'rgba(0, 0, 50, 0.8)');
        
        // 勝利テキスト
        renderer.drawTextCentered('CONGRATULATIONS!', centerX, centerY - 80, '#00ffff', '36px Courier New');
        renderer.drawTextCentered('ゲーム完全クリア！', centerX, centerY - 40, '#ffffff', '28px Courier New');
        
        // 統計情報
        if (this.gameEngine.gameStateManager) {
            const gameState = this.gameEngine.gameStateManager.getGameState();
            const gameStats = this.gameEngine.gameStateManager.getGameStats();
            
            renderer.drawTextCentered(
                `最終スコア: ${gameState.score.toLocaleString()}`,
                centerX, centerY + 10,
                '#ffff00', '24px Courier New'
            );
            
            if (gameStats.totalAccuracy > 0) {
                renderer.drawTextCentered(
                    `命中率: ${(gameStats.totalAccuracy * 100).toFixed(1)}%`,
                    centerX, centerY + 40,
                    '#ffffff', '20px Courier New'
                );
            }
            
            const playTimeSeconds = Math.floor(gameStats.totalPlayTime / 1000);
            const minutes = Math.floor(playTimeSeconds / 60);
            const seconds = playTimeSeconds % 60;
            renderer.drawTextCentered(
                `プレイ時間: ${minutes}:${seconds.toString().padStart(2, '0')}`,
                centerX, centerY + 70,
                '#ffffff', '20px Courier New'
            );
        }
        
        // 操作説明
        renderer.drawTextCentered('ENTER または ESC: タイトルに戻る', centerX, centerY + 120, '#ffffff', '16px Courier New');
    }
    
    /**
     * 遷移エフェクトの描画
     * @param {Renderer} renderer - レンダラー
     */
    renderTransition(renderer) {
        if (this.transitionType === 'fade') {
            const progress = this.transitionTimer / this.transitionDuration;
            const alpha = Math.sin(progress * Math.PI); // 0 → 1 → 0
            renderer.drawRect(0, 0, this.gameEngine.width, this.gameEngine.height, `rgba(0, 0, 0, ${alpha})`);
        }
    }
    
    /**
     * 現在のシーンを取得
     * @returns {string} 現在のシーン
     */
    getCurrentScene() {
        return this.currentScene;
    }
    
    /**
     * ゲーム中かどうかを判定
     * @returns {boolean} ゲーム中かどうか
     */
    isInGame() {
        return this.currentScene === this.scenes.GAME;
    }
}