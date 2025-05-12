# Stripe API検証用モデルサービス テスト手順書

## 前提条件

- Node.js (16.17.0以上)
- pnpm がインストールされていること
- Stripeアカウント (テストモード)
- テスト用APIキー、Webhookシークレット、Connect Client IDが用意されていること

## 1. 環境設定

### 1.1 プロジェクトのセットアップ

```bash
# プロジェクトディレクトリに移動
cd stripe-test

# 依存関係のインストール
pnpm install
```

### 1.2 環境変数の設定

`.dev.vars` ファイルを作成し、Stripeのテスト用APIキーを設定します：

```bash
# ファイルを作成
echo "STRIPE_SECRET_KEY=sk_test_your_test_key" > .dev.vars
echo "STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret" >> .dev.vars
echo "STRIPE_CONNECT_CLIENT_ID=ca_your_connect_client_id" >> .dev.vars
```

または、`wrangler secret` コマンドを使用して環境変数を設定することもできます：

```bash
wrangler secret put STRIPE_SECRET_KEY
# プロンプトが表示されたらStripeのテスト用秘密鍵を入力

wrangler secret put STRIPE_WEBHOOK_SECRET
# プロンプトが表示されたらWebhookシークレットを入力

wrangler secret put STRIPE_CONNECT_CLIENT_ID
# プロンプトが表示されたらConnect Client IDを入力
```

### 1.3 Stripeダッシュボードでの設定

#### 1.3.1 Webhookエンドポイントの設定

1. Stripeダッシュボードにログイン
2. 「開発者」→「Webhooks」を選択
3. 「エンドポイントを追加」をクリック
4. 以下の設定を行う：
   - エンドポイントURL: `https://your-domain.com/webhooks/stripe` (開発時は後述のngrokなどを使用)
   - イベント: 以下を選択
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `account.updated`
5. 「エンドポイントを追加」をクリック
6. 表示されるWebhookシークレットをコピーして環境変数に設定

#### 1.3.2 Connect アプリケーションの設定

1. Stripeダッシュボードで「Connect」→「設定」を選択
2. 「Connectアプリケーション」で「新しいアプリケーションを作成」をクリック
3. 以下の設定を行う：
   - 名前: 任意（例: Stremix Test）
   - リダイレクトURI: `http://localhost:8787/connect/dashboard`
   - ブランディング: 任意
4. 「作成」をクリック
5. 表示されるClient IDをコピーして環境変数に設定

## 2. 開発サーバーの起動

```bash
# 開発サーバーを起動
pnpm dev
```

これで `http://localhost:8787` でサービスが利用可能になります。

## 3. Webhookテスト用のトンネル設定（オプション）

開発環境でWebhookをテストするには、ローカルサーバーを公開する必要があります。ngrokなどのツールを使用します：

```bash
# ngrokをインストール (まだの場合)
npm install -g ngrok

# トンネルを作成
ngrok http 8787
```

表示されるURLを使用して、StripeダッシュボードでのWebhookエンドポイントを更新します：
```
https://xxxx-xxxx-xxxx-xxxx.ngrok.io/webhooks/stripe
```

## 4. 機能テスト手順

### 4.1 Connect機能テスト (販売者アカウント)

1. ブラウザで `http://localhost:8787/connect/` にアクセス
2. 「新規販売者登録」フォームに情報を入力
   - 名前: テスト販売者
   - メールアドレス: test@example.com
3. 「アカウント作成」ボタンをクリック
4. Stripeのオンボーディングページが表示されるので、テスト情報を入力
   - テスト用の銀行口座情報を入力（例: ルーティング番号 `110000000`、口座番号 `000123456789`）
   - その他の必要情報を入力
5. オンボーディング完了後、アカウント状態を確認
   - オンボーディング完了: ✓
   - 決済有効: ✓
   - 支払い有効: ✓
6. 「Stripeダッシュボードを開く」ボタンをクリックして、Connect アカウントのダッシュボードにアクセス

### 4.2 商品購入機能テスト

1. ブラウザで `http://localhost:8787/products/` にアクセス
2. 「販売者アカウント選択」ドロップダウンから先ほど作成したConnect アカウントを選択
3. 表示されている商品の中から1つを選び、「購入する」ボタンをクリック
4. Stripeのチェックアウトページが表示されるので、テストカード情報を入力
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来の日付（例: 12/30）
   - CVC: 任意の3桁の数字（例: 123）
   - 名前: 任意
   - 郵便番号: 任意の5桁の数字（例: 12345）
5. 「支払う」ボタンをクリック
6. 購入完了ページが表示されることを確認
7. Stripeダッシュボードで支払いと販売者への資金移動を確認
   - プラットフォーム手数料（15%）がアプリケーション手数料として計上されていることを確認
   - 残りの金額が販売者アカウントに移動していることを確認

### 4.3 サブスクリプション機能テスト

1. ブラウザで `http://localhost:8787/subscription/` にアクセス
2. 「顧客情報登録」フォームに情報を入力
   - 名前: テスト顧客
   - メールアドレス: customer@example.com
3. 「顧客情報を登録」ボタンをクリック
4. 利用可能なプランから1つを選び、「サブスクリプションを開始」ボタンをクリック
5. Stripeのチェックアウトページが表示されるので、テストカード情報を入力（商品購入テストと同様）
6. 「サブスクリプションを開始」ボタンをクリック
7. サブスクリプション開始メッセージが表示されることを確認
8. 「サブスクリプション管理」ボタンをクリックして、顧客ポータルにアクセス
9. ポータルでサブスクリプションの管理（支払い方法の更新、プランの変更、キャンセルなど）をテスト

### 4.4 Webhookイベントの確認

各テストを実行した後、ログを確認してWebhookイベントが正しく処理されていることを確認します：

```bash
# ログを確認
wrangler tail
```

以下のイベントが発生していることを確認：
- `checkout.session.completed`（商品購入時）
- `customer.subscription.created`（サブスクリプション開始時）
- `account.updated`（Connect アカウントのステータス変更時）

## 5. トラブルシューティング

### 5.1 APIキーエラー

エラーメッセージ: `STRIPE_SECRET_KEY is not set`

**解決策**:
- `.dev.vars` ファイルが正しく作成されているか確認
- `wrangler secret put STRIPE_SECRET_KEY` コマンドを再実行

### 5.2 CORSエラー

エラーメッセージ: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**解決策**:
- ブラウザのコンソールでCORSエラーを確認
- APIハンドラーがCORSヘッダーを正しく設定しているか確認

### 5.3 Webhook検証エラー

エラーメッセージ: `No signature header found` または `Webhook signature verification failed`

**解決策**:
- Webhookシークレットが正しく設定されているか確認
- ngrokなどを使用して、Webhookエンドポイントが外部からアクセス可能か確認

### 5.4 Connect アカウント作成エラー

エラーメッセージ: `Account creation failed`

**解決策**:
- Connect Client IDが正しく設定されているか確認
- StripeダッシュボードでリダイレクトURIが正しく設定されているか確認

## 6. 追加のテストケース

以下の追加テストケースも実施することで、より完全な検証が可能です：

1. **支払い失敗テスト**:
   - カード番号 `4000000000000002` を使用して支払い失敗をシミュレート

2. **サブスクリプション失敗テスト**:
   - カード番号 `4000000000000341` を使用して将来の支払い失敗をシミュレート

3. **3Dセキュア認証テスト**:
   - カード番号 `4000000000003220` を使用して3Dセキュア認証をシミュレート

4. **プラン変更テスト**:
   - サブスクリプション開始後、顧客ポータルでプランをアップグレード/ダウングレード

5. **キャンセルテスト**:
   - サブスクリプションをキャンセルし、期間終了時の処理を確認

## 7. 本番環境へのデプロイ

検証が完了したら、本番環境にデプロイします：

```bash
# 本番環境の環境変数を設定
wrangler secret put STRIPE_SECRET_KEY --env production
wrangler secret put STRIPE_WEBHOOK_SECRET --env production
wrangler secret put STRIPE_CONNECT_CLIENT_ID --env production

# デプロイ
pnpm run deploy --env production
```

デプロイ後、Stripeダッシュボードでのエンドポイント設定を本番URLに更新することを忘れないでください。

---

このテスト手順書に従って検証を行うことで、Stripeの主要機能（Connect、Checkout、Billing）が正しく実装されていることを確認できます。問題が発生した場合は、トラブルシューティングセクションを参照してください。