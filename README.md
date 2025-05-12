# Stripe 検証用モデルサービス

このプロジェクトは、Stremixの決済システム開発のためのStripe API検証用モデルサービスです。Connect機能（販売者向け）とBilling機能（サブスクリプション）の両方を検証できます。

## 機能

1. **Connect機能**
   - 販売者アカウントの作成とオンボーディング
   - アカウント状態の確認
   - Stripeダッシュボードへのアクセス

2. **商品購入機能**
   - 手数料分配モデルでの商品販売
   - チェックアウトフロー
   - 購入完了処理

3. **サブスクリプション機能**
   - 顧客登録
   - プラン選択と購入
   - サブスクリプション管理ポータル

## セットアップ手順

### 1. 前提条件

- Node.js 16以上
- Stripeアカウント（テストモード）

### 2. インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/stripe-test.git
cd stripe-test

# 依存関係のインストール
npm install
```

### 3. Stripe設定

1. Stripeダッシュボードにログイン
2. APIキーを取得（テストモード）
3. Webhookエンドポイントを作成（後述）
4. Connectアプリケーションを設定（後述）

### 4. 環境変数の設定

```bash
# API秘密鍵の設定
wrangler secret put STRIPE_SECRET_KEY
# プロンプトが表示されたらStripeの秘密鍵を入力

# Webhookシークレットの設定
wrangler secret put STRIPE_WEBHOOK_SECRET
# プロンプトが表示されたらWebhookシークレットを入力

# Connect Client IDの設定
wrangler secret put STRIPE_CONNECT_CLIENT_ID
# プロンプトが表示されたらConnect Client IDを入力
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

これで `http://localhost:8787` でサービスが利用可能になります。

## Webhook設定

Stripeダッシュボードで以下のイベントを受け取るWebhookエンドポイントを設定してください：

- checkout.session.completed
- invoice.paid
- invoice.payment_failed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- account.updated

エンドポイントURL: `https://your-domain.com/webhooks/stripe`（開発時は ngrok などを使用）

## Connect設定

1. Stripeダッシュボードで「Connect」→「Settings」に移動
2. 「Connect applications」で新しいアプリケーションを作成
3. リダイレクトURIを設定: `https://your-domain.com/connect/dashboard`
4. 取得したClient IDを環境変数に設定

## テスト

テストモードでは、以下のテストカード情報が使用できます：

- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の未来の日付
- CVC: 任意の3桁の数字
- 郵便番号: 任意の5桁の数字

## 本番環境への適用

このモデルサービスは、Stremixの本番環境開発のための参考実装です。以下の点に注意してください：

1. **セキュリティ強化**: 本番環境では認証、入力バリデーション、XSS対策などを実装
2. **データベース連携**: ユーザー情報、商品情報、購入履歴などの永続化
3. **エラー処理**: より堅牢なエラーハンドリングと通知システムの実装
4. **UI/UX改善**: 実際のサービスに合わせたデザインと機能の実装

## ライセンス

MIT