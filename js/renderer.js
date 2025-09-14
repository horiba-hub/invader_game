/**
 * レンダリングクラス
 * Canvas描画の抽象化レイヤーを提供
 */
class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        
        // デフォルト設定
        this.defaultFont = '16px Courier New';
        this.defaultTextAlign = 'left';
        this.defaultTextBaseline = 'top';
        
        console.log('Renderer初期化完了');
    }
    
    /**
     * 画面クリア
     * @param {string} color - 背景色（デフォルト: 黒）
     */
    clear(color = '#000') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * 矩形の描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {string} color - 色
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    /**
     * 矩形の枠線描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {string} color - 色
     * @param {number} lineWidth - 線の太さ
     */
    drawRectOutline(x, y, width, height, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }
    
    /**
     * 円の描画
     * @param {number} x - 中心X座標
     * @param {number} y - 中心Y座標
     * @param {number} radius - 半径
     * @param {string} color - 色
     */
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * 円の枠線描画
     * @param {number} x - 中心X座標
     * @param {number} y - 中心Y座標
     * @param {number} radius - 半径
     * @param {string} color - 色
     * @param {number} lineWidth - 線の太さ
     */
    drawCircleOutline(x, y, radius, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * 線の描画
     * @param {number} x1 - 開始X座標
     * @param {number} y1 - 開始Y座標
     * @param {number} x2 - 終了X座標
     * @param {number} y2 - 終了Y座標
     * @param {string} color - 色
     * @param {number} lineWidth - 線の太さ
     */
    drawLine(x1, y1, x2, y2, color, lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    
    /**
     * テキストの描画
     * @param {string} text - 描画するテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} color - 色
     * @param {string} font - フォント
     * @param {string} align - テキスト配置
     */
    drawText(text, x, y, color = '#fff', font = this.defaultFont, align = this.defaultTextAlign) {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = this.defaultTextBaseline;
        this.ctx.fillText(text, x, y);
    }
    
    /**
     * 中央揃えテキストの描画
     * @param {string} text - 描画するテキスト
     * @param {number} x - 中心X座標
     * @param {number} y - Y座標
     * @param {string} color - 色
     * @param {string} font - フォント
     */
    drawTextCentered(text, x, y, color = '#fff', font = this.defaultFont) {
        this.drawText(text, x, y, color, font, 'center');
    }
    
    /**
     * 右揃えテキストの描画
     * @param {string} text - 描画するテキスト
     * @param {number} x - 右端X座標
     * @param {number} y - Y座標
     * @param {string} color - 色
     * @param {string} font - フォント
     */
    drawTextRight(text, x, y, color = '#fff', font = this.defaultFont) {
        this.drawText(text, x, y, color, font, 'right');
    }
    
    /**
     * 影付きテキストの描画
     * @param {string} text - 描画するテキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} color - テキスト色
     * @param {string} shadowColor - 影の色
     * @param {number} offsetX - 影のX方向オフセット
     * @param {number} offsetY - 影のY方向オフセット
     * @param {string} font - フォント
     * @param {string} align - テキスト配置
     */
    drawTextWithShadow(text, x, y, color = '#fff', shadowColor = '#000', offsetX = 2, offsetY = 2, font = this.defaultFont, align = this.defaultTextAlign) {
        // 影を描画
        this.drawText(text, x + offsetX, y + offsetY, shadowColor, font, align);
        // テキストを描画
        this.drawText(text, x, y, color, font, align);
    }
    
    /**
     * プレイヤー宇宙船の描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} size - サイズ
     * @param {string} color - 色
     */
    drawPlayer(x, y, size = 20, color = '#00ff00') {
        const halfSize = size / 2;
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - halfSize);
        this.ctx.lineTo(x - halfSize, y + halfSize);
        this.ctx.lineTo(x + halfSize, y + halfSize);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * 敵インベーダーの描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} size - サイズ
     * @param {string} color - 色
     */
    drawEnemy(x, y, size = 16, color = '#ff0000') {
        const halfSize = size / 2;
        
        // 簡単な敵の形状（矩形）
        this.drawRect(x - halfSize, y - halfSize, size, size, color);
        
        // 目を描画
        this.drawRect(x - halfSize + 3, y - halfSize + 3, 3, 3, '#fff');
        this.drawRect(x + halfSize - 6, y - halfSize + 3, 3, 3, '#fff');
    }
    
    /**
     * 弾丸の描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} size - サイズ
     * @param {string} color - 色
     */
    drawBullet(x, y, size = 4, color = '#ffff00') {
        this.drawCircle(x, y, size, color);
    }
    
    /**
     * 武器アイテムの描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} size - サイズ
     * @param {string} color - 色
     */
    drawWeaponPickup(x, y, size = 12, color = '#ff00ff') {
        const halfSize = size / 2;
        
        // ダイヤモンド形状
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - halfSize);
        this.ctx.lineTo(x + halfSize, y);
        this.ctx.lineTo(x, y + halfSize);
        this.ctx.lineTo(x - halfSize, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * 爆発エフェクトの描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} size - サイズ
     * @param {string} color - 色
     * @param {number} frame - アニメーションフレーム
     */
    drawExplosion(x, y, size = 20, color = '#ff8800', frame = 0) {
        const particles = 8;
        const maxRadius = size * (1 + frame * 0.1);
        
        for (let i = 0; i < particles; i++) {
            const angle = (Math.PI * 2 * i) / particles;
            const radius = maxRadius * (0.5 + Math.random() * 0.5);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            this.drawCircle(px, py, 3, color);
        }
    }
}