# 設計文書

## 概要

HTML5 CanvasとJavaScriptを使用して5面構成のインベーダーゲームを実装します。段階的難易度設計により子供から大人まで楽しめるゲーム体験を提供します。オブジェクト指向設計を採用し、ゲームエンジン、エンティティシステム、武器システム、レベルシステムを組み合わせて構築します。

## アーキテクチャ

### 全体構造

```
Game Engine
├── Scene Manager (スタート画面、ゲーム画面、ゲームオーバー画面)
├── Input Manager (キーボード入力処理)
├── Renderer (Canvas描画処理)
├── Audio Manager (効果音・BGM)
└── Game State Manager (スコア、ライフ、レベル管理)

Game Objects
├── Player (プレイヤー宇宙船)
├── Enemy (敵インベーダー)
├── Bullet (弾丸)
├── WeaponPickup (武器アイテム)
└── Explosion (爆発エフェクト)

Systems
├── Collision System (衝突判定)
├── Weapon System (武器管理)
├── Level System (面管理)
└── Spawn System (敵・アイテム生成)
```

## コンポーネントとインターフェース

### 1. ゲームエンジン (GameEngine)

**責任:**
- ゲームループの管理 (30FPS)
- シーン遷移の制御
- 全体的なゲーム状態の管理

**主要メソッド:**
- `init()`: ゲーム初期化
- `update(deltaTime)`: ゲーム状態更新
- `render()`: 描画処理
- `handleInput()`: 入力処理

### 2. プレイヤー (Player)

**プロパティ:**
- `position: {x, y}`: 位置
- `health: number`: ライフ
- `weapon: Weapon`: 現在の武器
- `speed: number`: 移動速度

**メソッド:**
- `move(direction)`: 移動処理
- `shoot()`: 弾発射
- `takeDamage()`: ダメージ処理
- `upgradeWeapon(weaponType)`: 武器アップグレード

### 3. 敵 (Enemy)

**プロパティ:**
- `position: {x, y}`: 位置
- `health: number`: 体力
- `speed: number`: 移動速度
- `shootCooldown: number`: 弾発射間隔
- `points: number`: 撃破時のスコア

**メソッド:**
- `update(deltaTime)`: 移動・行動更新
- `shoot()`: 弾発射
- `takeDamage(damage)`: ダメージ処理
- `dropWeapon()`: 武器ドロップ判定

### 4. 武器システム (WeaponSystem)

**武器タイプ:**
1. **Basic**: 単発弾
2. **Rapid**: 連射弾
3. **Spread**: 拡散弾
4. **Laser**: 貫通レーザー

**Weaponクラスのプロパティ:**
- `damage: number`: 威力
- `fireRate: number`: 発射レート
- `bulletSpeed: number`: 弾速
- `pattern: string`: 発射パターン

## データモデル

### GameState
```javascript
{
  score: number,
  lives: number,
  level: number,
  weaponLevel: number,
  gameStatus: 'menu' | 'playing' | 'paused' | 'gameOver' | 'victory'
}
```

### LevelConfig
```javascript
{
  stage: number,
  name: string,
  description: string,
  enemyFormation: {
    rows: number,
    cols: number,
    enemyTypes: Array<string>,
    spacing: {x: number, y: number},
    startY: number,
    baseSpeed: number
  },
  shootingConfig: {
    shootRate: number,
    maxBullets: number,
    aggressiveness: number
  },
  specialFeatures: Array<string>
}
```

### ステージ設計

**ステージ1（チュートリアル）**
- 敵編隊: 3×6 (18体)
- 敵タイプ: basic のみ
- 速度: 30 px/s
- 特徴: 操作練習、基本ルール学習

**ステージ2（初級）**
- 敵編隊: 4×8 (32体)
- 敵タイプ: basic, fast
- 速度: 50 px/s
- 特徴: 標準的なゲームプレイ

**ステージ3（中級）**
- 敵編隊: 5×8 (40体)
- 敵タイプ: basic, fast, shooter
- 速度: 70 px/s
- 特徴: 射撃敵登場、戦略性向上

**ステージ4（上級）**
- 敵編隊: 5×10 (50体)
- 敵タイプ: basic, fast, shooter, strong
- 速度: 90 px/s
- 特徴: 全敵タイプ、高密度編隊

**ステージ5（エキスパート）**
- 敵編隊: カスタム配置
- 敵タイプ: boss, elite
- 速度: 110 px/s
- 特徴: ボス戦、特殊攻撃パターン

### WeaponPickup
```javascript
{
  position: {x, y},
  weaponType: string,
  lifetime: number
}
```

## エラーハンドリング

### 1. 入力エラー
- 無効なキー入力の無視
- 連続入力の制限（弾の連射制限）

### 2. 描画エラー
- Canvas要素の存在確認
- WebGL/Canvas2Dコンテキストの取得失敗時のフォールバック

### 3. ゲーム状態エラー
- 不正な状態遷移の防止
- オブジェクトの境界外移動の制限

### 4. リソースエラー
- 画像・音声ファイルの読み込み失敗時の代替処理
- メモリリークの防止（不要オブジェクトの削除）

## テスト戦略

### 1. ユニットテスト
- **Player クラス**: 移動、射撃、ダメージ処理
- **Enemy クラス**: AI行動、弾発射、撃破処理
- **WeaponSystem**: 武器アップグレード、弾生成
- **CollisionSystem**: 衝突判定の精度

### 2. 統合テスト
- **ゲームループ**: 30FPS維持、状態更新の整合性
- **レベル遷移**: 面クリア条件、難易度調整
- **武器システム**: ドロップ確率、アップグレード効果

### 3. エンドツーエンドテスト
- **ゲームプレイフロー**: スタート→面1→面2→クリア
- **ゲームオーバーフロー**: ライフ0→ゲームオーバー→リスタート
- **武器システム統合**: 敵撃破→武器ドロップ→取得→効果確認

### 4. パフォーマンステスト
- **フレームレート**: 30FPS維持の確認
- **メモリ使用量**: 長時間プレイでのメモリリーク検証
- **入力応答性**: キー入力から反応までの遅延測定

### 5. ユーザビリティテスト
- **操作性**: キーボード操作の直感性
- **視覚的フィードバック**: 爆発エフェクト、スコア表示
- **ゲームバランス**: 難易度の適切性、武器バランス