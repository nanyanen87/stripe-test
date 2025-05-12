# stripe-test

## 概要
Stripe API を利用したサンプルプロジェクトです。

## ディレクトリ構成

```
stripe-test/
├── src/
│   ├── index.js
│   ├── handlers/
│   │   ├── connect.js
│   │   ├── products.js
│   │   ├── subscription.js
│   │   └── webhooks.js
│   └── utils/
│       └── stripe-client.js
├── public/
│   ├── index.html
│   ├── connect/
│   │   └── index.html
│   ├── products/
│   │   ├── index.html
│   │   └── success.html
│   └── subscription/
│       └── index.html
├── package.json
├── wrangler.toml
└── README.md
```

- `public/` 配下に静的ファイル（HTML等）を配置します。
- 静的ファイルは `wrangler.toml` の `[site]` 設定により自動的にサーブされます。
- `src/handlers/static.js` は不要になりました。

## 開発・デプロイ

1. 依存パッケージのインストール
   ```sh
   pnpm install
   ```
2. ローカル開発サーバー起動
   ```sh
   wrangler dev
   ```
3. デプロイ
   ```sh
   wrangler publish
   ```

## 環境変数
Stripe のシークレットキー等は `wrangler secret` コマンドで設定してください。

## ライセンス
MIT