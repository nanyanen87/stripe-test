// src/handlers/static.js

/**
 * 開発用の静的ファイルサービングハンドラー
 * 本番環境では実際のホスティングサービス（CF Pages等）を使用することを推奨
 * @param {string} path - リクエストパス
 * @param {Object} env - 環境変数
 * @return {Promise<Response>} レスポンス
 */
export async function handleStaticFiles(path, env) {
    // インデックスページを返す
    if (path === '/' || path === '') {
      return serveIndexPage();
    }
    
    // 静的ファイルのマッピング（実際のプロジェクトではファイルシステムまたはアセットバンドラーを使用）
    if (path === '/connect/' || path === '/connect/index.html') {
      return serveConnectPage();
    } else if (path === '/products/' || path === '/products/index.html') {
      return serveProductsPage();
    } else if (path === '/products/success.html' || path === '/products/success') {
      return serveSuccessPage();
    } else if (path === '/subscription/' || path === '/subscription/index.html') {
      return serveSubscriptionPage();
    }
    
    // 404エラー
    return new Response('Not Found', { status: 404 });
  }
  
  /**
   * ホームページを提供
   * @return {Response} レスポンス
   */
  function serveIndexPage() {
    return new Response(
      `<!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Stripe 検証サービス</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { color: #333; }
          h2 { color: #555; margin-top: 30px; }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .btn {
            display: inline-block;
            background-color: #6772e5;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            margin-right: 10px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Stripe 検証サービス</h1>
        <p>このサービスは Stremix のための Stripe 機能検証用モデルサービスです。</p>
        
        <div class="card">
          <h2>1. 販売者向け機能</h2>
          <p>Stripe Connect を利用した販売者アカウント作成と決済の検証</p>
          <a href="/connect/" class="btn">販売者機能へ</a>
        </div>
        
        <div class="card">
          <h2>2. 商品購入</h2>
          <p>プラットフォーム手数料を含む商品購入フローの検証</p>
          <a href="/products/" class="btn">商品購入へ</a>
        </div>
        
        <div class="card">
          <h2>3. サブスクリプション</h2>
          <p>リミックス機能のサブスクリプション管理の検証</p>
          <a href="/subscription/" class="btn">サブスクリプションへ</a>
        </div>
      </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
        },
      }
    );
  }
  
  /**
   * Connect ページを提供
   * 実際のプロジェクトでは、HTMLファイルを読み込んで返すロジックを実装
   * @return {Response} レスポンス
   */
  function serveConnectPage() {
    // 簡略化のため、実際のHTMLコンテンツは省略
    return new Response(
      `<!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>販売者登録 - Stripe 検証サービス</title>
        <!-- スタイルと内容は前述のConnect HTML内容に合わせてください -->
      </head>
      <body>
        <h1>販売者機能検証</h1>
        <p><a href="/" class="btn-link">ホームに戻る</a></p>
        <!-- 省略: 実際の内容をここに配置 -->
        <p>販売者登録・管理機能が表示されます。実際の環境ではHTMLファイルをロードして表示します。</p>
      </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
        },
      }
    );
  }
  
  /**
   * Products ページを提供
   * @return {Response} レスポンス
   */
  function serveProductsPage() {
    // 簡略化のため、実際のHTMLコンテンツは省略
    return new Response(
      `<!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>商品購入 - Stripe 検証サービス</title>
        <!-- スタイルと内容は前述のProducts HTML内容に合わせてください -->
      </head>
      <body>
        <h1>商品購入検証</h1>
        <p><a href="/" class="btn">ホームに戻る</a></p>
        <!-- 省略: 実際の内容をここに配置 -->
        <p>商品一覧と購入機能が表示されます。実際の環境ではHTMLファイルをロードして表示します。</p>
      </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
        },
      }
    );
  }
  
  /**
   * Success ページを提供
   * @return {Response} レスポンス
   */
  function serveSuccessPage() {
    // 簡略化のため、実際のHTMLコンテンツは省略
    return new Response(
      `<!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>購入完了 - Stripe 検証サービス</title>
        <!-- スタイルと内容は前述のSuccess HTML内容に合わせてください -->
      </head>
      <body>
        <div class="card">
          <div class="success-icon">✓</div>
          <h1>購入が完了しました！</h1>
          <!-- 省略: 実際の内容をここに配置 -->
          <p>購入詳細が表示されます。実際の環境ではHTMLファイルをロードして表示します。</p>
        </div>
      </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
        },
      }
    );
  }
  
  /**
   * Subscription ページを提供
   * @return {Response} レスポンス
   */
  function serveSubscriptionPage() {
    // 簡略化のため、実際のHTMLコンテンツは省略
    return new Response(
      `<!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>サブスクリプション - Stripe 検証サービス</title>
        <!-- スタイルと内容は前述のSubscription HTML内容に合わせてください -->
      </head>
      <body>
        <h1>サブスクリプション検証</h1>
        <p><a href="/" class="btn">ホームに戻る</a></p>
        <!-- 省略: 実際の内容をここに配置 -->
        <p>サブスクリプションプランと機能が表示されます。実際の環境ではHTMLファイルをロードして表示します。</p>
      </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
        },
      }
    );
  }