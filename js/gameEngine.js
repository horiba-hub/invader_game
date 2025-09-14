/**
 * ゲームエンジンの基本クラス
 * 60FPSでのゲームループ、Canvas描画、基本的なゲーム状態管理を提供
 */
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // ゲーム状態
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // FPS計測
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.currentFPS = 0;
        
        // ゲームオブジェクト管理
        this.gameObjects = [];
        
        // レンダリング設定
        this.smoothing = true;
        
        // 入力管理
        this.inputManager = new InputManager();
        
        // レンダラー
        this.renderer = new Renderer(this.ctx, this.width, this.height);
        
        // 衝突判定システム
        this.collisionSystem = new CollisionSystem(this);
        
        // ダメージシステム
        this.damageSystem = new DamageSystem(this);
        
        // レベル管理システム
        this.levelManager = new LevelManager(this);
        
        // ゲーム状態管理システム
        this.gameStateManager = new GameStateManager(this);
        
        // UIシステム
        this.uiSystem = new UISystem(this);
        
        // シーン管理システム
        this.sceneManager = new SceneManager(this);
        
        // 初期化
        this.init();
    }
    
    /**
     * ゲームエンジンの初期化
     */
    init() {
        // Canvas設定の最適化
        this.ctx.imageSmoothingEnabled = this.smoothing;
        this.ctx.textBaseline = 'top';
        
        // エラーハンドリング
        if (!this.canvas) {
            throw new Error('Canvas要素が見つかりません');
        }
        if (!this.ctx) {
            throw new Error('Canvas 2Dコンテキストの取得に失敗しました');
        }
        
        console.log('ゲームエンジン初期化完了');
        console.log(`Canvas サイズ: ${this.width}x${this.height}`);
        console.log(`目標FPS: ${this.targetFPS}`);
    }
    
    /**
     * ゲームループの開始
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.fpsTimer = 0;
        this.frameCount = 0;
        this.gameLoop();
        console.log('ゲームループ開始');
    }
    
    /**
     * ゲームループの停止
     */
    stop() {
        this.isRunning = false;
        console.log('ゲームループ停止');
    }
    
    /**
     * ゲームの一時停止/再開
     */
    pause() {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? 'ゲーム一時停止' : 'ゲーム再開');
    }
    
    /**
     * メインゲームループ
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= this.frameInterval) {
            // FPS計測
            this.frameCount++;
            this.fpsTimer += deltaTime;
            
            if (this.fpsTimer >= 1000) {
                this.currentFPS = this.frameCount;
                this.frameCount = 0;
                this.fpsTimer = 0;
            }
            
            // 一時停止の入力処理は常に行う
            this.handlePauseInput();
            
            // ゲーム更新（一時停止中は更新しない）
            if (!this.isPaused) {
                this.update(deltaTime);
            } else {
                // 一時停止中でも入力管理の更新は必要
                this.inputManager.update();
            }
            
            // 描画は常に実行
            this.render();
            
            this.lastTime = currentTime - (deltaTime % this.frameInterval);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * ゲーム状態の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 入力処理
        this.handleInput();
        
        // ゲームオブジェクトの更新
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.gameObjects[i];
            if (obj.update) {
                obj.update(deltaTime);
            }
            
            // 削除フラグが立っているオブジェクトを削除
            if (obj.shouldDestroy) {
                this.gameObjects.splice(i, 1);
            }
        }
        
        // シーン管理の更新
        this.sceneManager.update(deltaTime);
        
        // ゲーム中のみ他のシステムを更新
        if (this.sceneManager.isInGame()) {
            this.collisionSystem.update(deltaTime);
            this.damageSystem.update(deltaTime);
            this.levelManager.update(deltaTime);
        }
        
        // 常に更新するシステム
        this.gameStateManager.update(deltaTime);
        this.uiSystem.update(deltaTime);
        
        // 入力管理の更新
        this.inputManager.update();
    }
    
    /**
     * 入力処理
     */
    handleInput() {
        // 通常のゲーム入力処理（一時停止以外）
        // 一時停止の処理は handlePauseInput() で別途処理
    }
    
    /**
     * 一時停止入力の処理
     * 一時停止中でも常に処理される
     */
    handlePauseInput() {
        if (this.inputManager.isPausePressed()) {
            this.pause();
        }
    }
    
    /**
     * 描画処理
     */
    render() {
        // 画面クリア
        this.clearScreen();
        
        // ゲーム中のみゲームオブジェクトを描画
        if (this.sceneManager.isInGame()) {
            for (const obj of this.gameObjects) {
                if (obj.render) {
                    this.ctx.save();
                    obj.render(this.ctx);
                    this.ctx.restore();
                }
            }
            
            // システムの描画
            this.damageSystem.render(this.renderer);
            this.levelManager.render(this.renderer);
        }
        
        // シーンの描画
        this.sceneManager.render(this.renderer);
        
        // デバッグモードの場合のみ衝突判定の描画
        if (this.collisionSystem.debugMode) {
            this.collisionSystem.renderDebug(this.renderer);
        }
        
        // デバッグ情報の描画
        this.renderDebugInfo();
        
        // 一時停止中の表示
        if (this.isPaused) {
            this.renderPauseOverlay();
        }
    }
    
    /**
     * 画面クリア
     */
    clearScreen() {
        this.renderer.clear();
    }
    
    /**
     * デバッグ情報の描画
     */
    renderDebugInfo() {
        this.renderer.drawText(`FPS: ${this.currentFPS}`, 10, this.height - 30, '#fff', '12px Courier New');
        this.renderer.drawText(`Objects: ${this.gameObjects.length}`, 10, this.height - 15, '#fff', '12px Courier New');
    }
    
    /**
     * 一時停止オーバーレイの描画
     */
    renderPauseOverlay() {
        this.renderer.drawRect(0, 0, this.width, this.height, 'rgba(0, 0, 0, 0.7)');
        this.renderer.drawTextCentered('PAUSED', this.width / 2, this.height / 2 - 24, '#fff', '48px Courier New');
    }
    
    /**
     * ゲームオブジェクトの追加
     * @param {GameObject} gameObject - 追加するゲームオブジェクト
     */
    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
        
        // GameObjectの場合、ゲームエンジンの参照を設定
        if (gameObject.setGameEngine) {
            gameObject.setGameEngine(this);
        }
    }
    
    /**
     * ゲームオブジェクトの削除
     * @param {Object} gameObject - 削除するゲームオブジェクト
     */
    removeGameObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }
    
    /**
     * Canvas上の座標が境界内かチェック
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {boolean} 境界内かどうか
     */
    isInBounds(x, y) {
        return x >= 0 && x <= this.width && y >= 0 && y <= this.height;
    }
    
    /**
     * レベル開始時のイベントハンドラー
     * @param {number} level - 開始するレベル
     * @param {Object} config - レベル設定
     */
    onLevelStart(level, config) {
        console.log(`レベル${level}開始: ${config.name}`);
        
        // 既存の敵をクリア
        this.gameObjects = this.gameObjects.filter(obj => !(obj instanceof Enemy));
        
        // プレイヤーをリセット（ライフは維持）
        const player = this.gameObjects.find(obj => obj instanceof Player);
        if (player && level === 1) {
            player.reset();
        }
        
        // 新しい編隊を作成
        if (window.enemyFormation) {
            window.enemyFormation.createFormation(level, config);
        }
        if (window.enemyShootingSystem) {
            window.enemyShootingSystem.setLevel(level, config);
        }
        
        // ゲーム状態を更新
        if (this.gameStateManager) {
            this.gameStateManager.setLevel(level);
        }
    }
    
    /**
     * レベルクリア時のイベントハンドラー
     * @param {number} level - クリアしたレベル
     * @param {number} bonusScore - ボーナススコア
     */
    onLevelClear(level, bonusScore) {
        console.log(`レベル${level}クリア！ボーナス: ${bonusScore}点`);
        
        // UIに通知
        if (this.uiSystem) {
            this.uiSystem.onLevelClear(level);
        }
        
        // 最終レベルの場合は勝利画面へ
        if (level >= this.levelManager.maxLevel) {
            setTimeout(() => {
                this.sceneManager.showVictory();
            }, 2000);
        }
    }
    
    /**
     * ゲームオーバー時のイベントハンドラー
     * @param {number} level - 失敗したレベル
     */
    onGameOver(level) {
        console.log(`ゲームオーバー - レベル${level}`);
        
        // UIに通知
        if (this.uiSystem) {
            this.uiSystem.onGameOver();
        }
        
        // ゲームオーバー画面に遷移
        setTimeout(() => {
            this.sceneManager.showGameOver();
        }, 1000);
    }
    
    /**
     * ゲーム完了時のイベントハンドラー
     * @param {number} completionBonus - 完了ボーナス
     */
    onGameComplete(completionBonus) {
        console.log(`ゲーム完全クリア！完了ボーナス: ${completionBonus}点`);
        
        // 勝利画面に遷移
        this.sceneManager.showVictory();
    }
    
    /**
     * ゲームリスタート
     */
    restartGame() {
        // 全ゲームオブジェクトをクリア
        this.gameObjects = [];
        
        // プレイヤーを再作成
        const player = new Player(this.width / 2, this.height - 50);
        player.initWeaponSystem();
        this.addGameObject(player);
        
        // ゲーム状態をリセット
        if (this.gameStateManager) {
            this.gameStateManager.resetGameState();
        }
        
        // レベル1を開始
        if (this.levelManager) {
            this.levelManager.startLevel(1);
        }
    }
}