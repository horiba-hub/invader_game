/**
 * ダメージシステム
 * ダメージ計算、エフェクト、ノックバックなどを管理
 */
class DamageSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // ダメージエフェクトの管理
        this.damageEffects = [];
        
        // ダメージ設定
        this.damageMultiplier = 1.0;
        this.criticalChance = 0.1; // 10%のクリティカル確率
        this.criticalMultiplier = 2.0;
        
        console.log('DamageSystem初期化完了');
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // ダメージエフェクトの更新
        this.updateDamageEffects(deltaTime);
    }
    
    /**
     * ダメージエフェクトの更新
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    updateDamageEffects(deltaTime) {
        for (let i = this.damageEffects.length - 1; i >= 0; i--) {
            const effect = this.damageEffects[i];
            effect.update(deltaTime);
            
            if (effect.shouldDestroy) {
                this.damageEffects.splice(i, 1);
            }
        }
    }
    
    /**
     * ダメージを適用
     * @param {GameObject} attacker - 攻撃者
     * @param {GameObject} target - 対象
     * @param {number} baseDamage - 基本ダメージ
     * @param {string} damageType - ダメージタイプ
     * @returns {Object} ダメージ結果
     */
    applyDamage(attacker, target, baseDamage, damageType = 'normal') {
        if (!target.active || target.invulnerable) {
            return { damage: 0, blocked: true };
        }
        
        // ダメージ計算
        const damageResult = this.calculateDamage(attacker, target, baseDamage, damageType);
        
        // ダメージを適用
        if (target.takeDamage) {
            target.takeDamage(damageResult.finalDamage);
        } else if (target.health !== undefined) {
            target.health -= damageResult.finalDamage;
        }
        
        // ダメージエフェクトを作成
        this.createDamageEffect(target, damageResult);
        
        // ノックバック効果
        if (damageResult.finalDamage > 0) {
            this.applyKnockback(attacker, target, damageResult);
        }
        
        console.log(`ダメージ適用: ${damageResult.finalDamage} (${damageResult.isCritical ? 'クリティカル' : '通常'})`);
        
        return damageResult;
    }
    
    /**
     * ダメージ計算
     * @param {GameObject} attacker - 攻撃者
     * @param {GameObject} target - 対象
     * @param {number} baseDamage - 基本ダメージ
     * @param {string} damageType - ダメージタイプ
     * @returns {Object} ダメージ計算結果
     */
    calculateDamage(attacker, target, baseDamage, damageType) {
        let finalDamage = baseDamage * this.damageMultiplier;
        let isCritical = false;
        
        // クリティカル判定
        if (Math.random() < this.criticalChance) {
            finalDamage *= this.criticalMultiplier;
            isCritical = true;
        }
        
        // ダメージタイプ別の処理
        switch (damageType) {
            case 'laser':
                finalDamage *= 1.5; // レーザーは1.5倍ダメージ
                break;
            case 'explosion':
                finalDamage *= 2.0; // 爆発は2倍ダメージ
                break;
            case 'piercing':
                // 貫通ダメージは防御を無視
                break;
        }
        
        // 対象の防御力を考慮（将来の拡張用）
        if (target.defense) {
            finalDamage = Math.max(1, finalDamage - target.defense);
        }
        
        // 最小ダメージは1
        finalDamage = Math.max(1, Math.floor(finalDamage));
        
        return {
            baseDamage: baseDamage,
            finalDamage: finalDamage,
            isCritical: isCritical,
            damageType: damageType
        };
    }
    
    /**
     * ダメージエフェクトを作成
     * @param {GameObject} target - 対象
     * @param {Object} damageResult - ダメージ結果
     */
    createDamageEffect(target, damageResult) {
        // ダメージ数値表示エフェクト
        const damageText = new DamageTextEffect(
            target.x, 
            target.y - target.height / 2,
            damageResult.finalDamage,
            damageResult.isCritical
        );
        this.damageEffects.push(damageText);
        
        // ヒットエフェクト
        const hitEffect = new HitEffect(target.x, target.y, damageResult.damageType);
        this.damageEffects.push(hitEffect);
        
        // 画面シェイク（大ダメージの場合）
        if (damageResult.finalDamage >= 3 || damageResult.isCritical) {
            this.createScreenShake(5, 200);
        }
    }
    
    /**
     * ノックバック効果を適用
     * @param {GameObject} attacker - 攻撃者
     * @param {GameObject} target - 対象
     * @param {Object} damageResult - ダメージ結果
     */
    applyKnockback(attacker, target, damageResult) {
        if (!target.setVelocity) return;
        
        const knockbackForce = damageResult.finalDamage * 50;
        const dx = target.x - attacker.x;
        const dy = target.y - attacker.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const knockbackX = (dx / distance) * knockbackForce;
            const knockbackY = (dy / distance) * knockbackForce;
            
            // 現在の速度にノックバックを追加
            target.vx += knockbackX;
            target.vy += knockbackY;
            
            // ノックバック効果を一定時間後に減衰
            setTimeout(() => {
                target.vx *= 0.5;
                target.vy *= 0.5;
            }, 100);
        }
    }
    
    /**
     * 画面シェイクを作成
     * @param {number} intensity - 強度
     * @param {number} duration - 持続時間（ミリ秒）
     */
    createScreenShake(intensity, duration) {
        // 画面シェイクエフェクト（後でカメラシステムで実装）
        console.log(`画面シェイク: 強度${intensity}, 持続時間${duration}ms`);
    }
    
    /**
     * 描画処理
     * @param {Renderer} renderer - レンダラー
     */
    render(renderer) {
        // ダメージエフェクトの描画
        this.damageEffects.forEach(effect => {
            if (effect.render) {
                effect.render(renderer);
            }
        });
    }
    
    /**
     * ダメージ倍率の設定
     * @param {number} multiplier - 倍率
     */
    setDamageMultiplier(multiplier) {
        this.damageMultiplier = multiplier;
        console.log(`ダメージ倍率を${multiplier}に設定`);
    }
    
    /**
     * クリティカル確率の設定
     * @param {number} chance - 確率（0.0-1.0）
     */
    setCriticalChance(chance) {
        this.criticalChance = Math.max(0, Math.min(1, chance));
        console.log(`クリティカル確率を${this.criticalChance * 100}%に設定`);
    }
}

/**
 * ダメージテキストエフェクトクラス
 */
class DamageTextEffect {
    constructor(x, y, damage, isCritical = false) {
        this.x = x;
        this.y = y;
        this.startY = y;
        this.damage = damage;
        this.isCritical = isCritical;
        
        // エフェクト設定
        this.lifetime = 1000; // 1秒
        this.age = 0;
        this.shouldDestroy = false;
        
        // 移動設定
        this.vy = -50; // 上向きに移動
        this.vx = (Math.random() - 0.5) * 20; // 少し横にずれる
        
        // 色設定
        this.color = isCritical ? '#ff0000' : '#ffffff';
        this.fontSize = isCritical ? '16px' : '12px';
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        this.age += deltaTime;
        
        // 位置更新
        this.x += this.vx * (deltaTime / 1000);
        this.y += this.vy * (deltaTime / 1000);
        
        // 重力効果
        this.vy += 20 * (deltaTime / 1000);
        
        // 寿命チェック
        if (this.age >= this.lifetime) {
            this.shouldDestroy = true;
        }
    }
    
    /**
     * 描画処理
     * @param {Renderer} renderer - レンダラー
     */
    render(renderer) {
        const alpha = 1 - (this.age / this.lifetime);
        const color = this.isCritical ? 
            `rgba(255, 0, 0, ${alpha})` : 
            `rgba(255, 255, 255, ${alpha})`;
        
        renderer.drawTextCentered(
            this.damage.toString(),
            this.x, this.y,
            color,
            `${this.fontSize} Courier New`
        );
        
        // クリティカルの場合は追加エフェクト
        if (this.isCritical) {
            renderer.drawTextCentered(
                '!',
                this.x + 15, this.y - 5,
                `rgba(255, 255, 0, ${alpha})`,
                '14px Courier New'
            );
        }
    }
}

/**
 * ヒットエフェクトクラス
 */
class HitEffect {
    constructor(x, y, damageType = 'normal') {
        this.x = x;
        this.y = y;
        this.damageType = damageType;
        
        // エフェクト設定
        this.lifetime = 300; // 0.3秒
        this.age = 0;
        this.shouldDestroy = false;
        
        // パーティクル設定
        this.particles = [];
        this.createParticles();
    }
    
    /**
     * パーティクルを作成
     */
    createParticles() {
        const particleCount = this.damageType === 'explosion' ? 12 : 6;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 50 + Math.random() * 50;
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 2 + Math.random() * 3
            });
        }
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
     */
    update(deltaTime) {
        this.age += deltaTime;
        
        // パーティクル更新
        this.particles.forEach(particle => {
            particle.x += particle.vx * (deltaTime / 1000);
            particle.y += particle.vy * (deltaTime / 1000);
            particle.life -= deltaTime / this.lifetime;
            
            // 減速
            particle.vx *= 0.98;
            particle.vy *= 0.98;
        });
        
        // 寿命チェック
        if (this.age >= this.lifetime) {
            this.shouldDestroy = true;
        }
    }
    
    /**
     * 描画処理
     * @param {Renderer} renderer - レンダラー
     */
    render(renderer) {
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                const alpha = particle.life;
                let color;
                
                switch (this.damageType) {
                    case 'laser':
                        color = `rgba(0, 255, 0, ${alpha})`;
                        break;
                    case 'explosion':
                        color = `rgba(255, 100, 0, ${alpha})`;
                        break;
                    default:
                        color = `rgba(255, 255, 255, ${alpha})`;
                        break;
                }
                
                renderer.drawCircle(particle.x, particle.y, particle.size, color);
            }
        });
    }
}