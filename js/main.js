/**
 * メインゲーム初期化とエントリーポイント
 */

// グローバル変数
let gameEngine;
let player;
let enemyFormation;
let enemyShootingSystem;

/**
 * ページ読み込み完了時の初期化
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('インベーダーゲーム初期化開始');
        
        // ゲームエンジンの初期化
        gameEngine = new GameEngine('gameCanvas');
        
        // ゲーム初期化
        initGame();
        
        // ゲームエンジン開始
        gameEngine.start();
        
        console.log('ゲーム初期化完了');
    } catch (error) {
        console.error('ゲーム初期化エラー:', error);
        alert('ゲームの初期化に失敗しました。コンソールを確認してください。');
    }
});

/**
 * ゲームの初期化
 */
function initGame() {
    // 敵システムの初期化
    enemyFormation = new EnemyFormation(gameEngine);
    enemyShootingSystem = new EnemyShootingSystem(gameEngine);
    
    // グローバル変数として設定（GameEngineから参照するため）
    window.enemyFormation = enemyFormation;
    window.enemyShootingSystem = enemyShootingSystem;
    
    // ゲームシステム管理オブジェクト
    const gameSystemManager = {
        update: function(deltaTime) {
            // ゲーム中のみ敵システムを更新
            if (gameEngine.sceneManager.isInGame()) {
                enemyFormation.update(deltaTime);
                enemyShootingSystem.update(deltaTime);
            }
        },
        
        render: function(ctx) {
            // ゲーム中のみ情報を表示
            if (gameEngine.sceneManager.isInGame()) {
                const renderer = gameEngine.renderer;
                
                // 現在のレベル表示
                const currentLevel = gameEngine.levelManager ? gameEngine.levelManager.currentLevel : 1;
                renderer.drawTextCentered(
                    `インベーダーゲーム - レベル${currentLevel}`, 
                    gameEngine.width / 2, 20, 
                    '#00ff00', '20px Courier New'
                );
                
                // 操作説明（小さく表示）
                renderer.drawText(
                    '矢印キー: 移動, スペース: 射撃, P: 一時停止', 
                    10, gameEngine.height - 50, 
                    '#ffffff', '12px Courier New'
                );
            }
        }
    };
    
    gameEngine.addGameObject(gameSystemManager);
}

// 衝突判定は CollisionSystem で自動処理されるため、この関数は不要