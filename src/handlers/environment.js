// src/handlers/environment.js
import { createSuccessResponse, createErrorResponse } from '../utils/stripe-client';

/**
 * 環境変数の設定状態を確認するハンドラ
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @return {Promise<Response>} レスポンス
 */
export async function handleEnvironmentCheck(request, env) {
  // CORSヘッダーを設定
  if (request.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }
  
  try {
    // 環境変数の存在を確認（値の内容は漏洩させない）
    const envStatus = {
      stripeSecretKey: !!env.STRIPE_SECRET_KEY,
      webhookSecret: !!env.STRIPE_WEBHOOK_SECRET,
      connectClientId: !!env.STRIPE_CONNECT_CLIENT_ID,
      baseUrl: env.BASE_URL || 'http://localhost:8787'
    };
    
    return createSuccessResponse(envStatus);
  } catch (error) {
    console.error('Environment check error:', error);
    return createErrorResponse(error.message);
  }
}

/**
 * CORS プリフライトリクエストへの応答
 */
function handleCorsPreflightRequest() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}