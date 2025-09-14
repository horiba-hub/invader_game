/**
 * UIシステムクラス
 * ゲーム情報の動的更新とUI要素の管理を行う
 */
class UISystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // UI要素の参照
        this.uiElements = {
            score: document.getElementById('score'),
            lives: document.getElementById('lives'),
            level: document.getElementById('level'),
            weapon: document.getElementById('weapon')
        };
        
        // UI状態
        this.uiState = {
            visible: true,
            animating: false,
            notifications: []
        };
        
        // アニメーション設定
        this.animations = {
            scoreIncrease: { duration: 500, scale: 1.2 },
            lifeLoss: { duration: 300, flash: true },
            levelUp: { duration: 1000, glow: true },
            weaponUpgrade: { duration: 800, bounce: true }
        };
        
        // 通知システム
        this.notificationQueue = [];
        this.maxNotifications = 3;
        this.notificationDuration = 3000; // 3秒
        
        console.log('UISystem初期化完了');
        this.initializeUI();
    }
    
    /**
     * UIの初期化
     */
    initializeUI() {
        // UI要素の存在確認
        Object.keys(this.uiElements).forEach(key => {
            if (!this.uiElements[key]) {
                console.warn(`UI要素が見つかりません: ${key}`);
            }
        });
        
        // 初期値の設定
        this.updateScore(0);
        this.updateLives(3);
        this.updateLevel(1);
        this.updateWeapon('Basic');
        
        // 通知エリアの作成
        this.createNotificationArea();
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 通知の更新
        this.updateNotifications(deltaTime);
        
        // アニメーションの更新
        this.updateAnimations(deltaTime);
    }
    
    /**
     * スコアを更新
     * @param {number} score - 新しいスコア
     * @param {boolean} animate - アニメーションするかどうか
     */
    updateScore(score, animate = false) {
        if (this.uiElements.score) {
            this.uiElements.score.textContent = `スコア: ${score.toLocaleString()}`;
            
            if (animate) {
                this.animateElement(this.uiElements.score, 'scoreIncrease');
            }
        }
    }
    
    /**
     * ライフを更新
     * @param {number} lives - 新しいライフ数
     * @param {boolean} animate - アニメーションするかどうか
     */
    updateLives(lives, animate = false) {
        if (this.uiElements.lives) {
            this.uiElements.lives.textContent = `ライフ: ${lives}`;
            
            // ライフの色を変更
            if (lives <= 1) {
                this.uiElements.lives.style.color = '#ff0000'; // 赤
            } else if (lives <= 2) {
                this.uiElements.lives.style.color = '#ffaa00'; // オレンジ
            } else {
                this.uiElements.lives.style.color = '#ff0000'; // 元の赤
            }
            
            if (animate && lives >= 0) {
                this.animateElement(this.uiElements.lives, 'lifeLoss');
            }
        }
    }
    
    /**
     * レベルを更新
     * @param {number} level - 新しいレベル
     * @param {boolean} animate - アニメーションするかどうか
     */
    updateLevel(level, animate = false) {
        if (this.uiElements.level) {
            this.uiElements.level.textContent = `レベル: ${level}`;
            
            if (animate) {
                this.animateElement(this.uiElements.level, 'levelUp');
            }
        }
    }
    
    /**
     * 武器を更新
     * @param {string} weaponName - 武器名
     * @param {number} weaponLevel - 武器レベル
     * @param {boolean} animate - アニメーションするかどうか
     */
    updateWeapon(weaponName, weaponLevel = 1, animate = false) {
        if (this.uiElements.weapon) {
            const levelText = weaponLevel > 1 ? ` Lv.${weaponLevel}` : '';
            this.uiElements.weapon.textContent = `武器: ${weaponName}${levelText}`;
            
            // 武器レベルに応じて色を変更
            if (weaponLevel >= 3) {
                this.uiElements.weapon.style.color = '#ff00ff'; // マゼンタ
            } else if (weaponLevel >= 2) {
                this.uiElements.weapon.style.color = '#00ffff'; // シアン
            } else {
                this.uiElements.weapon.style.color = '#ffff00'; // 黄色
            }
            
            if (animate) {
                this.animateElement(this.uiElements.weapon, 'weaponUpgrade');
            }
        }
    }
    
    /**
     * 要素をアニメーション
     * @param {HTMLElement} element - アニメーションする要素
     * @param {string} animationType - アニメーションタイプ
     */
    animateElement(element, animationType) {
        if (!element || this.uiState.animating) return;
        
        const animation = this.animations[animationType];
        if (!animation) return;
        
        this.uiState.animating = true;
        
        switch (animationType) {
            case 'scoreIncrease':
                this.animateScoreIncrease(element, animation);
                break;
            case 'lifeLoss':
                this.animateLifeLoss(element, animation);
                break;
            case 'levelUp':
                this.animateLevelUp(element, animation);
                break;
            case 'weaponUpgrade':
                this.animateWeaponUpgrade(element, animation);
                break;
        }
        
        // アニメーション終了後にフラグをリセット
        setTimeout(() => {
            this.uiState.animating = false;
        }, animation.duration);
    }
    
    /**
     * スコア増加アニメーション
     * @param {HTMLElement} element - 要素
     * @param {Object} animation - アニメーション設定
     */
    animateScoreIncrease(element, animation) {
        element.style.transform = `scale(${animation.scale})`;
        element.style.transition = `transform ${animation.duration / 2}ms ease-out`;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, animation.duration / 2);
        
        setTimeout(() => {
            element.style.transition = '';
        }, animation.duration);
    }
    
    /**
     * ライフ減少アニメーション
     * @param {HTMLElement} element - 要素
     * @param {Object} animation - アニメーション設定
     */
    animateLifeLoss(element, animation) {
        let flashCount = 0;
        const maxFlashes = 3;
        const flashInterval = animation.duration / (maxFlashes * 2);
        
        const flash = () => {
            if (flashCount < maxFlashes * 2) {
                element.style.opacity = flashCount % 2 === 0 ? '0.3' : '1';
                flashCount++;
                setTimeout(flash, flashInterval);
            } else {
                element.style.opacity = '1';
            }
        };
        
        flash();
    }
    
    /**
     * レベルアップアニメーション
     * @param {HTMLElement} element - 要素
     * @param {Object} animation - アニメーション設定
     */
    animateLevelUp(element, animation) {
        element.style.textShadow = '0 0 10px #00ff00, 0 0 20px #00ff00';
        element.style.transition = `text-shadow ${animation.duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.textShadow = '';
            element.style.transition = '';
        }, animation.duration);
    }
    
    /**
     * 武器アップグレードアニメーション
     * @param {HTMLElement} element - 要素
     * @param {Object} animation - アニメーション設定
     */
    animateWeaponUpgrade(element, animation) {
        let bounceCount = 0;
        const maxBounces = 3;
        const bounceInterval = animation.duration / maxBounces;
        
        const bounce = () => {
            if (bounceCount < maxBounces) {
                element.style.transform = 'translateY(-5px)';
                element.style.transition = `transform ${bounceInterval / 2}ms ease-out`;
                
                setTimeout(() => {
                    element.style.transform = 'translateY(0)';
                }, bounceInterval / 2);
                
                bounceCount++;
                setTimeout(bounce, bounceInterval);
            } else {
                element.style.transition = '';
            }
        };
        
        bounce();
    }
    
    /**
     * 通知を表示
     * @param {string} message - 通知メッセージ
     * @param {string} type - 通知タイプ ('info', 'success', 'warning', 'error')
     * @param {number} duration - 表示時間（ミリ秒）
     */
    showNotification(message, type = 'info', duration = this.notificationDuration) {
        const notification = {
            id: Date.now() + Math.random(),
            message: message,
            type: type,
            duration: duration,
            age: 0,
            element: null
        };
        
        // 通知要素を作成
        notification.element = this.createNotificationElement(notification);
        
        // 通知をキューに追加
        this.notificationQueue.push(notification);
        
        // 最大数を超えた場合は古い通知を削除
        while (this.notificationQueue.length > this.maxNotifications) {
            const oldNotification = this.notificationQueue.shift();
            this.removeNotificationElement(oldNotification);
        }
        
        // 通知エリアに追加
        const notificationArea = document.getElementById('notificationArea');
        if (notificationArea && notification.element) {
            notificationArea.appendChild(notification.element);
        }
    }
    
    /**
     * 通知エリアを作成
     */
    createNotificationArea() {
        let notificationArea = document.getElementById('notificationArea');
        if (!notificationArea) {
            notificationArea = document.createElement('div');
            notificationArea.id = 'notificationArea';
            notificationArea.style.cssText = `
                position: absolute;
                top: 120px;
                right: 10px;
                width: 300px;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(notificationArea);
        }
    }
    
    /**
     * 通知要素を作成
     * @param {Object} notification - 通知オブジェクト
     * @returns {HTMLElement} 通知要素
     */
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            border-left: 4px solid ${this.getNotificationColor(notification.type)};
            animation: slideInRight 0.3s ease-out;
        `;
        element.textContent = notification.message;
        
        return element;
    }
    
    /**
     * 通知タイプに応じた色を取得
     * @param {string} type - 通知タイプ
     * @returns {string} 色
     */
    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#00ff00';
            case 'warning': return '#ffaa00';
            case 'error': return '#ff0000';
            default: return '#00aaff';
        }
    }
    
    /**
     * 通知の更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateNotifications(deltaTime) {
        for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
            const notification = this.notificationQueue[i];
            notification.age += deltaTime;
            
            // フェードアウト効果
            if (notification.age > notification.duration - 500) {
                const fadeRatio = (notification.duration - notification.age) / 500;
                if (notification.element) {
                    notification.element.style.opacity = Math.max(0, fadeRatio);
                }
            }
            
            // 期限切れの通知を削除
            if (notification.age >= notification.duration) {
                this.removeNotificationElement(notification);
                this.notificationQueue.splice(i, 1);
            }
        }
    }
    
    /**
     * 通知要素を削除
     * @param {Object} notification - 通知オブジェクト
     */
    removeNotificationElement(notification) {
        if (notification.element && notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
        }
    }
    
    /**
     * アニメーションの更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateAnimations(deltaTime) {
        // 現在は特別な処理なし
        // 将来的にカスタムアニメーションを追加可能
    }
    
    /**
     * UIの表示/非表示を切り替え
     * @param {boolean} visible - 表示するかどうか
     */
    setVisible(visible) {
        this.uiState.visible = visible;
        
        Object.values(this.uiElements).forEach(element => {
            if (element) {
                element.style.display = visible ? 'block' : 'none';
            }
        });
    }
    
    /**
     * ゲームオーバー時のUI更新
     */
    onGameOver() {
        this.showNotification('ゲームオーバー', 'error', 5000);
    }
    
    /**
     * レベルクリア時のUI更新
     * @param {number} level - クリアしたレベル
     */
    onLevelClear(level) {
        this.showNotification(`レベル${level}クリア！`, 'success', 3000);
        this.updateLevel(level + 1, true);
    }
    
    /**
     * 武器取得時のUI更新
     * @param {string} weaponName - 武器名
     * @param {number} weaponLevel - 武器レベル
     */
    onWeaponUpgrade(weaponName, weaponLevel) {
        this.showNotification(`武器アップグレード: ${weaponName}`, 'success', 2000);
        this.updateWeapon(weaponName, weaponLevel, true);
    }
    
    /**
     * スコア加算時のUI更新
     * @param {number} points - 加算されたスコア
     * @param {number} totalScore - 総スコア
     */
    onScoreAdd(points, totalScore) {
        if (points > 0) {
            this.updateScore(totalScore, true);
            
            if (points >= 100) {
                this.showNotification(`+${points}点`, 'info', 1500);
            }
        }
    }
}