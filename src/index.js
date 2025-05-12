// src/index.js
import { handleConnectRequests } from './handlers/connect';
import { handleProductRequests } from './handlers/products';
import { handleSubscriptionRequests } from './handlers/subscription';
import { handleWebhooks } from './handlers/webhooks';
import { handleStaticFiles } from './handlers/static';

/**
 * リクエストルーティングとハンドリングを行うメインハンドラ
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Object} ctx - コンテキスト
 * @return {Promise<Response>} レスポンス
 */
export default {
  async fetch(request, env, ctx) {
    // URLパスに基づいてルーティング
    const url = new URL(request.url);
    const path = url.pathname;
    
    console.log(`Request to: ${path}`);
    
    // CORSプリフライトリクエストの処理
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest();
    }
    
    try {
      // パス別ハンドラーにディスパッチ
      if (path.startsWith('/api/connect')) {
        return await handleConnectRequests(request, env, ctx);
      } else if (path.startsWith('/api/products')) {
        return await handleProductRequests(request, env, ctx);
      } else if (path.startsWith('/api/subscription')) {
        return await handleSubscriptionRequests(request, env, ctx);
      } else if (path.startsWith('/webhooks/stripe')) {
        return await handleWebhooks(request, env, ctx);
      } else {
        // 静的ファイルのサービング（開発用）
        return await handleStaticFiles(path, env);
      }
    } catch (error) {
      console.error('Unhandled error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

/**
 * CORS プリフライトリクエストへの応答
 */
function handleCorsPreflightRequest() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}