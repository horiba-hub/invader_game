/**
 * 衝突判定システム
 * ゲームオブジェクト間の衝突検出と処理を効率的に管理
 */
class CollisionSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 衝突判定の設定
        this.enabled = true;
        this.debugMode = false;
        
        // パフォーマンス最適化用
        this.spatialGrid = new SpatialGrid(gameEngine.width, gameEngine.height, 64);
        this.collisionPairs = new Set();
        
        // 統計情報
        this.stats = {
            checksPerFrame: 0,
            collisionsPerFrame: 0,
            totalChecks: 0,
            totalCollisions: 0
        };
        
        console.log('CollisionSystem初期化完了');
    }
    
    /**
     * 衝突判定の更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        if (!this.enabled) return;
        
        // 統計情報をリセット
        this.stats.checksPerFrame = 0;
        this.stats.collisionsPerFrame = 0;
        
        // 空間分割グリッドを更新
        this.updateSpatialGrid();
        
        // 衝突判定を実行
        this.performCollisionDetection();
        
        // 統計情報を更新
        this.stats.totalChecks += this.stats.checksPerFrame;
        this.stats.totalCollisions += this.stats.collisionsPerFrame;
    }
    
    /**
     * 空間分割グリッドの更新
     */
    updateSpatialGrid() {
        this.spatialGrid.clear();
        
        // アクティブなゲームオブジェクトをグリッドに追加
        this.gameEngine.gameObjects.forEach(obj => {
            if (obj.active && obj instanceof GameObject) {
                this.spatialGrid.insert(obj);
            }
        });
    }
    
    /**
     * 衝突判定の実行
     */
    performCollisionDetection() {
        // 衝突ペアをクリア
        this.collisionPairs.clear();
        
        // プレイヤー弾と敵の衝突
        this.checkPlayerBulletEnemyCollisions();
        
        // 敵弾とプレイヤーの衝突
        this.checkEnemyBulletPlayerCollisions();
        
        // プレイヤーと敵の直接衝突
        this.checkPlayerEnemyCollisions();
        
        // プレイヤーと武器アイテムの衝突
        this.checkPlayerWeaponPickupCollisions();
        
        // 弾丸同士の衝突（オプション）
        if (this.debugMode) {
            this.checkBulletBulletCollisions();
        }
    }
    
    /**
     * プレイヤー弾と敵の衝突判定
     */
    checkPlayerBulletEnemyCollisions() {
        const playerBullets = this.gameEngine.gameObjects.filter(obj => 
            obj instanceof Bullet && obj.isPlayerBullet && obj.active
        );
        const enemies = this.gameEngine.gameObjects.filter(obj => 
            obj instanceof Enemy && obj.active
        );
        
        playerBullets.forEach(bullet => {
            // 空間分割を使用して近くの敵のみをチェック
            const nearbyEnemies = this.spatialGrid.getNearbyObjects(bullet, enemies);
            
            nearbyEnemies.forEach(enemy => {
                this.stats.checksPerFrame++;
                
                if (this.checkCollision(bullet, enemy)) {
                    this.handleCollision(bullet, enemy);
                    this.stats.collisionsPerFrame++;
                }
            });
        });
    }
    
    /**
     * 敵弾とプレイヤーの衝突判定
     */
    checkEnemyBulletPlayerCollisions() {
        const enemyBullets = this.gameEngine.gameObjects.filter(obj => 
            obj instanceof Bullet && !obj.isPlayerBullet && obj.active
        );
        const player = this.gameEngine.gameObjects.find(obj => 
            obj instanceof Player && obj.active
        );
        
        if (!player) return;
        
        enemyBullets.forEach(bullet => {
            this.stats.checksPerFrame++;
            
            if (this.checkCollision(bullet, player)) {
                this.handleCollision(bullet, player);
                this.stats.collisionsPerFrame++;
            }
        });
    }
    
    /**
     * プレイヤーと敵の直接衝突判定
     */
    checkPlayerEnemyCollisions() {
        const player = this.gameEngine.gameObjects.find(obj => 
            obj instanceof Player && obj.active
        );
        const enemies = this.gameEngine.gameObjects.filter(obj => 
            obj instanceof Enemy && obj.active
        );
        
        if (!player) return;
        
        enemies.forEach(enemy => {
            this.stats.checksPerFrame++;
            
            if (this.checkCollision(player, enemy)) {
                this.handleCollision(player, enemy);
                this.stats.collisionsPerFrame++;
            }
        });
    }
    
    /**
     * プレイヤーと武器アイテムの衝突判定
     */
    checkPlayerWeaponPickupCollisions() {
        const player = this.gameEngine.gameObjects.find(obj => 
            obj instanceof Player && obj.active
        );
        const weaponPickups = this.gameEngine.gameObjects.filter(obj => 
            obj instanceof WeaponPickup && obj.active
        );
        
        if (!player) {
            console.log('プレイヤーが見つかりません');
            return;
        }
        
        if (weaponPickups.length > 0) {
            console.log(`武器アイテム数: ${weaponPickups.length}`);
        }
        
        weaponPickups.forEach(pickup => {
            this.stats.checksPerFrame++;
            
            const distance = player.distanceTo(pickup);
            
            // 簡単な距離ベースの衝突判定（30ピクセル以内）
            if (distance <= 30) {
                this.handleCollision(player, pickup);
                this.stats.collisionsPerFrame++;
            }
            // 通常の衝突判定もチェック
            else if (this.checkCollision(player, pickup)) {
                this.handleCollision(player, pickup);
                this.stats.collisionsPerFrame++;
            }
        });
    }
    
    /**
     * 弾丸同士の衝突判定（デバッグ用）
     */
    checkBulletBulletCollisions() {
        const playerBullets = this.gameEngine.gameObjects.filter(obj => 
            obj instanceof Bullet && obj.isPlayerBullet && obj.active
        );
        const enemyBullets = this.gameEngine.gameObjects.filter(obj => 
            obj instanceof Bullet && !obj.isPlayerBullet && obj.active
        );
        
        playerBullets.forEach(playerBullet => {
            enemyBullets.forEach(enemyBullet => {
                this.stats.checksPerFrame++;
                
                if (this.checkCollision(playerBullet, enemyBullet)) {
                    this.handleCollision(playerBullet, enemyBullet);
                    this.stats.collisionsPerFrame++;
                }
            });
        });
    }
    
    /**
     * 2つのオブジェクト間の衝突判定
     * @param {GameObject} obj1 - オブジェクト1
     * @param {GameObject} obj2 - オブジェクト2
     * @returns {boolean} 衝突しているかどうか
     */
    checkCollision(obj1, obj2) {
        if (!obj1.active || !obj2.active) return false;
        
        // 武器アイテムとプレイヤーの場合は円形衝突判定を使用
        if ((obj1 instanceof WeaponPickup && obj2 instanceof Player) ||
            (obj1 instanceof Player && obj2 instanceof WeaponPickup)) {
            return this.checkCircleCollision(obj1, obj2);
        }
        
        // その他は矩形衝突判定（AABB）
        return this.checkAABBCollision(obj1, obj2);
    }
    
    /**
     * AABB（軸平行境界ボックス）衝突判定
     * @param {GameObject} obj1 - オブジェクト1
     * @param {GameObject} obj2 - オブジェクト2
     * @returns {boolean} 衝突しているかどうか
     */
    checkAABBCollision(obj1, obj2) {
        const bounds1 = obj1.getBounds();
        const bounds2 = obj2.getBounds();
        
        return !(bounds1.right < bounds2.left || 
                bounds1.left > bounds2.right || 
                bounds1.bottom < bounds2.top || 
                bounds1.top > bounds2.bottom);
    }
    
    /**
     * 円形衝突判定
     * @param {GameObject} obj1 - オブジェクト1
     * @param {GameObject} obj2 - オブジェクト2
     * @returns {boolean} 衝突しているかどうか
     */
    checkCircleCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let radius1 = Math.max(obj1.width, obj1.height) / 2;
        let radius2 = Math.max(obj2.width, obj2.height) / 2;
        
        // 武器アイテムの場合は取得しやすくするため半径を大きくする
        if (obj1 instanceof WeaponPickup) {
            radius1 += 10;
        }
        if (obj2 instanceof WeaponPickup) {
            radius2 += 10;
        }
        
        const collisionDistance = radius1 + radius2;
        const isColliding = distance < collisionDistance;
        
        // デバッグ情報
        if ((obj1 instanceof WeaponPickup || obj2 instanceof WeaponPickup) && distance < 50) {
            console.log(`円形衝突判定: 距離=${distance.toFixed(1)}, 必要距離=${collisionDistance.toFixed(1)}, 衝突=${isColliding}`);
        }
        
        return isColliding;
    }
    
    /**
     * 衝突処理
     * @param {GameObject} obj1 - オブジェクト1
     * @param {GameObject} obj2 - オブジェクト2
     */
    handleCollision(obj1, obj2) {
        // 武器アイテムとプレイヤーの衝突は重複チェックをスキップ
        const isWeaponPickup = (obj1 instanceof WeaponPickup && obj2 instanceof Player) ||
                              (obj1 instanceof Player && obj2 instanceof WeaponPickup);
        
        if (!isWeaponPickup) {
            // 通常の重複チェック
            const id1 = obj1.id || `${obj1.constructor.name}_${obj1.x}_${obj1.y}`;
            const id2 = obj2.id || `${obj2.constructor.name}_${obj2.x}_${obj2.y}`;
            const pairKey = `${id1}-${id2}`;
            
            if (this.collisionPairs.has(pairKey)) return;
            this.collisionPairs.add(pairKey);
        }
        
        // 両オブジェクトの衝突処理を呼び出し
        if (obj1.onCollision) {
            obj1.onCollision(obj2);
        }
        if (obj2.onCollision) {
            obj2.onCollision(obj1);
        }
        
        // デバッグモードでは衝突をログ出力
        if (this.debugMode) {
            console.log(`衝突処理実行: ${obj1.constructor.name} vs ${obj2.constructor.name}`);
        }
    }
    
    /**
     * デバッグ描画
     * @param {Renderer} renderer - レンダラー
     */
    renderDebug(renderer) {
        if (!this.debugMode) return;
        
        // アクティブなオブジェクトの境界ボックスを描画
        this.gameEngine.gameObjects.forEach(obj => {
            if (obj.active && obj instanceof GameObject) {
                const bounds = obj.getBounds();
                renderer.drawRectOutline(
                    bounds.left, bounds.top,
                    bounds.right - bounds.left, bounds.bottom - bounds.top,
                    '#00ff00', 1
                );
            }
        });
        
        // 空間分割グリッドを描画
        this.spatialGrid.renderDebug(renderer);
        
        // 統計情報を表示
        renderer.drawText(
            `衝突判定: ${this.stats.checksPerFrame} 衝突: ${this.stats.collisionsPerFrame}`,
            10, 100, '#ffffff', '12px Courier New'
        );
    }
    
    /**
     * デバッグモードの切り替え
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        console.log(`衝突判定デバッグモード: ${this.debugMode ? 'ON' : 'OFF'}`);
    }
    
    /**
     * 衝突判定の有効/無効切り替え
     */
    toggleEnabled() {
        this.enabled = !this.enabled;
        console.log(`衝突判定: ${this.enabled ? '有効' : '無効'}`);
    }
    
    /**
     * 統計情報の取得
     * @returns {Object} 統計情報
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * 統計情報のリセット
     */
    resetStats() {
        this.stats.totalChecks = 0;
        this.stats.totalCollisions = 0;
    }
}

/**
 * 空間分割グリッドクラス
 * 衝突判定の最適化のために使用
 */
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = [];
        
        this.clear();
    }
    
    /**
     * グリッドをクリア
     */
    clear() {
        this.grid = [];
        for (let i = 0; i < this.rows * this.cols; i++) {
            this.grid[i] = [];
        }
    }
    
    /**
     * オブジェクトをグリッドに挿入
     * @param {GameObject} obj - 挿入するオブジェクト
     */
    insert(obj) {
        const bounds = obj.getBounds();
        const startCol = Math.max(0, Math.floor(bounds.left / this.cellSize));
        const endCol = Math.min(this.cols - 1, Math.floor(bounds.right / this.cellSize));
        const startRow = Math.max(0, Math.floor(bounds.top / this.cellSize));
        const endRow = Math.min(this.rows - 1, Math.floor(bounds.bottom / this.cellSize));
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const index = row * this.cols + col;
                this.grid[index].push(obj);
            }
        }
    }
    
    /**
     * 近くのオブジェクトを取得
     * @param {GameObject} obj - 基準オブジェクト
     * @param {Array} targetObjects - 検索対象のオブジェクト配列
     * @returns {Array} 近くのオブジェクトの配列
     */
    getNearbyObjects(obj, targetObjects) {
        const bounds = obj.getBounds();
        const startCol = Math.max(0, Math.floor(bounds.left / this.cellSize));
        const endCol = Math.min(this.cols - 1, Math.floor(bounds.right / this.cellSize));
        const startRow = Math.max(0, Math.floor(bounds.top / this.cellSize));
        const endRow = Math.min(this.rows - 1, Math.floor(bounds.bottom / this.cellSize));
        
        const nearbyObjects = new Set();
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const index = row * this.cols + col;
                this.grid[index].forEach(gridObj => {
                    if (targetObjects.includes(gridObj) && gridObj !== obj) {
                        nearbyObjects.add(gridObj);
                    }
                });
            }
        }
        
        return Array.from(nearbyObjects);
    }
    
    /**
     * デバッグ描画
     * @param {Renderer} renderer - レンダラー
     */
    renderDebug(renderer) {
        // グリッド線を描画
        for (let col = 0; col <= this.cols; col++) {
            const x = col * this.cellSize;
            renderer.drawLine(x, 0, x, this.height, '#333333', 1);
        }
        
        for (let row = 0; row <= this.rows; row++) {
            const y = row * this.cellSize;
            renderer.drawLine(0, y, this.width, y, '#333333', 1);
        }
        
        // オブジェクト数を各セルに表示
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                const count = this.grid[index].length;
                if (count > 0) {
                    const x = col * this.cellSize + this.cellSize / 2;
                    const y = row * this.cellSize + this.cellSize / 2;
                    renderer.drawTextCentered(count.toString(), x, y, '#ffff00', '10px Courier New');
                }
            }
        }
    }
}