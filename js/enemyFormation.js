/**
 * 敵編隊システム
 * 複数の敵を管理し、編隊移動と面ごとの配置を制御
 */
class EnemyFormation {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.enemies = [];
        
        // 編隊移動設定
        this.direction = 1; // 1: 右, -1: 左
        this.moveSpeed = 50; // ピクセル/秒
        this.dropDistance = 30; // 下に移動する距離
        this.edgeMargin = 50; // 画面端からのマージン
        
        // 編隊状態
        this.isMovingDown = false;
        this.moveDownTimer = 0;
        this.moveDownDuration = 500; // ミリ秒
        
        // レベル設定
        this.currentLevel = 1;
        this.levelConfigs = {
            1: {
                rows: 3,
                cols: 8,
                enemyTypes: ['basic', 'basic', 'fast'],
                spacing: { x: 40, y: 35 },
                startY: 80,
                baseSpeed: 50
            },
            2: {
                rows: 4,
                cols: 10,
                enemyTypes: ['basic', 'fast', 'shooter', 'strong'],
                spacing: { x: 35, y: 30 },
                startY: 60,
                baseSpeed: 60
            }
        };
        
        console.log('EnemyFormation初期化完了');
    }
    
    /**
     * 指定レベルの敵編隊を作成
     * @param {number} level - レベル番号
     * @param {Object} levelConfig - レベル設定（オプション）
     */
    createFormation(level, levelConfig = null) {
        this.currentLevel = level;
        this.clearFormation();
        
        // レベル設定を使用（提供されていない場合はデフォルト）
        const config = levelConfig?.enemyFormation || this.levelConfigs[level] || this.levelConfigs[2];
        const { rows, cols, enemyTypes, spacing, startY, baseSpeed } = config;
        
        // 基本速度を設定
        this.moveSpeed = baseSpeed || 50;
        
        // 編隊の中央揃え計算
        const formationWidth = (cols - 1) * spacing.x;
        const startX = (this.gameEngine.width - formationWidth) / 2;
        
        console.log(`レベル${level}の編隊を作成: ${rows}x${cols}, 速度: ${this.moveSpeed}`);
        
        // 敵を配置
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * spacing.x;
                const y = startY + row * spacing.y;
                
                // 行に応じて敵タイプを決定
                const enemyType = enemyTypes[row % enemyTypes.length];
                
                const enemy = new Enemy(x, y, enemyType);
                enemy.setSpeed(this.moveSpeed);
                
                // レベルに応じた敵の強化
                this.applyLevelScaling(enemy, level);
                
                this.enemies.push(enemy);
                this.gameEngine.addGameObject(enemy);
            }
        }
        
        console.log(`${this.enemies.length}体の敵を配置完了`);
    }
    
    /**
     * レベルに応じた敵の強化
     * @param {Enemy} enemy - 強化する敵
     * @param {number} level - 現在のレベル
     */
    applyLevelScaling(enemy, level) {
        const scalingFactor = 1 + (level - 1) * 0.2; // レベルごとに20%強化
        
        // 体力の強化
        if (enemy.maxHealth > 1) {
            enemy.maxHealth = Math.floor(enemy.maxHealth * scalingFactor);
            enemy.health = enemy.maxHealth;
        }
        
        // スコアの強化
        enemy.points = Math.floor(enemy.points * scalingFactor);
        
        // 射撃頻度の強化
        enemy.shootProbability *= (1 + (level - 1) * 0.1);
        enemy.shootCooldownTime *= (1 - (level - 1) * 0.1);
    }
    
    /**
     * 編隊をクリア
     */
    clearFormation() {
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.destroy();
            }
        });
        this.enemies = [];
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 生存している敵をフィルタリング
        this.enemies = this.enemies.filter(enemy => enemy.active);
        
        if (this.enemies.length === 0) {
            this.onFormationDestroyed();
            return;
        }
        
        // 編隊移動の更新
        this.updateFormationMovement(deltaTime);
        
        // 速度調整（敵が少なくなるほど速くなる）
        this.updateSpeed();
        
        // 画面下部到達チェック
        this.checkBottomReached();
    }
    
    /**
     * 編隊移動の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateFormationMovement(deltaTime) {
        if (this.isMovingDown) {
            this.updateDownwardMovement(deltaTime);
        } else {
            this.updateHorizontalMovement();
        }
    }
    
    /**
     * 水平移動の更新
     */
    updateHorizontalMovement() {
        // 編隊の端の位置を取得
        const leftmostX = Math.min(...this.enemies.map(e => e.x - e.width / 2));
        const rightmostX = Math.max(...this.enemies.map(e => e.x + e.width / 2));
        
        // 画面端に到達したかチェック
        const shouldChangeDirection = 
            (this.direction > 0 && rightmostX >= this.gameEngine.width - this.edgeMargin) ||
            (this.direction < 0 && leftmostX <= this.edgeMargin);
        
        if (shouldChangeDirection) {
            this.startDownwardMovement();
        } else {
            // 通常の水平移動
            this.enemies.forEach(enemy => {
                enemy.direction = this.direction;
                enemy.setSpeed(this.moveSpeed);
            });
        }
    }
    
    /**
     * 下向き移動の開始
     */
    startDownwardMovement() {
        this.isMovingDown = true;
        this.moveDownTimer = 0;
        this.direction *= -1; // 方向転換
        
        // 全ての敵を下向きに移動
        this.enemies.forEach(enemy => {
            enemy.setVelocity(0, this.dropDistance / (this.moveDownDuration / 1000));
        });
        
        console.log(`編隊が方向転換: 新しい方向=${this.direction}`);
    }
    
    /**
     * 下向き移動の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateDownwardMovement(deltaTime) {
        this.moveDownTimer += deltaTime;
        
        if (this.moveDownTimer >= this.moveDownDuration) {
            // 下向き移動終了、水平移動に戻る
            this.isMovingDown = false;
            this.enemies.forEach(enemy => {
                enemy.direction = this.direction;
                enemy.setSpeed(this.moveSpeed);
                enemy.setVelocity(enemy.speed * enemy.direction, 0);
            });
        }
    }
    
    /**
     * 速度調整（敵が少なくなるほど速くなる）
     */
    updateSpeed() {
        const config = this.levelConfigs[this.currentLevel] || this.levelConfigs[2];
        const totalEnemies = config.rows * config.cols;
        const remainingRatio = this.enemies.length / totalEnemies;
        
        // 残り敵数に応じて速度を調整（50%〜150%）
        const speedMultiplier = 1.5 - (remainingRatio * 0.5);
        const newSpeed = config.baseSpeed;
        this.moveSpeed = newSpeed * speedMultiplier;
        
        // 敵の速度を更新（下向き移動中は除く）
        if (!this.isMovingDown) {
            this.enemies.forEach(enemy => {
                enemy.setSpeed(this.moveSpeed);
            });
        }
    }
    
    /**
     * 画面下部到達チェック
     */
    checkBottomReached() {
        const hasReachedBottom = this.enemies.some(enemy => enemy.hasReachedBottom());
        
        if (hasReachedBottom) {
            this.onFormationReachedBottom();
        }
    }
    
    /**
     * 編隊が全滅した時の処理
     */
    onFormationDestroyed() {
        console.log('編隊が全滅しました');
        // レベルクリア処理（後でゲーム状態管理で実装）
        this.gameEngine.onLevelComplete?.();
    }
    
    /**
     * 編隊が画面下部に到達した時の処理
     */
    onFormationReachedBottom() {
        console.log('編隊が画面下部に到達 - ゲームオーバー');
        // ゲームオーバー処理（後でゲーム状態管理で実装）
        this.gameEngine.onGameOver?.();
    }
    
    /**
     * 編隊の統計情報を取得
     * @returns {Object} 統計情報
     */
    getStats() {
        const typeCount = {};
        this.enemies.forEach(enemy => {
            typeCount[enemy.enemyType] = (typeCount[enemy.enemyType] || 0) + 1;
        });
        
        return {
            totalEnemies: this.enemies.length,
            typeCount: typeCount,
            direction: this.direction,
            speed: this.moveSpeed,
            isMovingDown: this.isMovingDown
        };
    }
    
    /**
     * 特定タイプの敵を取得
     * @param {string} enemyType - 敵タイプ
     * @returns {Array} 該当する敵の配列
     */
    getEnemiesByType(enemyType) {
        return this.enemies.filter(enemy => enemy.enemyType === enemyType);
    }
    
    /**
     * 最前列の敵を取得（射撃優先度用）
     * @returns {Array} 最前列の敵の配列
     */
    getFrontRowEnemies() {
        if (this.enemies.length === 0) return [];
        
        // X座標でグループ化
        const columns = {};
        this.enemies.forEach(enemy => {
            const col = Math.round(enemy.x / 40); // 40は大体の間隔
            if (!columns[col] || enemy.y > columns[col].y) {
                columns[col] = enemy;
            }
        });
        
        return Object.values(columns);
    }
    
    /**
     * デバッグ描画
     * @param {Renderer} renderer - レンダラー
     */
    renderDebug(renderer) {
        if (this.enemies.length === 0) return;
        
        // 編隊の境界を描画
        const leftmostX = Math.min(...this.enemies.map(e => e.x - e.width / 2));
        const rightmostX = Math.max(...this.enemies.map(e => e.x + e.width / 2));
        const topmostY = Math.min(...this.enemies.map(e => e.y - e.height / 2));
        const bottommostY = Math.max(...this.enemies.map(e => e.y + e.height / 2));
        
        renderer.drawRectOutline(
            leftmostX, topmostY,
            rightmostX - leftmostX, bottommostY - topmostY,
            '#444444', 1
        );
        
        // 画面端のマージンを表示
        renderer.drawLine(this.edgeMargin, 0, this.edgeMargin, this.gameEngine.height, '#ff0000', 1);
        renderer.drawLine(this.gameEngine.width - this.edgeMargin, 0, this.gameEngine.width - this.edgeMargin, this.gameEngine.height, '#ff0000', 1);
        
        // 統計情報を表示
        const stats = this.getStats();
        renderer.drawText(
            `敵: ${stats.totalEnemies} 速度: ${Math.round(stats.speed)} 方向: ${this.direction}`,
            10, 50, '#ffffff', '12px Courier New'
        );
        renderer.drawText(
            `範囲: ${Math.round(leftmostX)} - ${Math.round(rightmostX)} (${this.isMovingDown ? '下向き' : '水平'})`,
            10, 65, '#ffffff', '12px Courier New'
        );
        renderer.drawText(
            `Y範囲: ${Math.round(topmostY)} - ${Math.round(bottommostY)}`,
            10, 80, '#ffffff', '12px Courier New'
        );
    }
}