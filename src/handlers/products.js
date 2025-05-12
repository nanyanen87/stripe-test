// src/api/product-api.js
import { initStripeFromEnv, createSuccessResponse, createErrorResponse } from '../utils/stripe-client';

/**
 * 製品・決済関連APIのリクエストハンドラ
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @return {Promise<Response>} レスポンス
 */
const handler = {
  async fetch(request, env) {
    // CORSヘッダーを設定
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest();
    }
    
    // URLから操作を判断
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/products', '');
    
    try {
      const stripe = initStripeFromEnv(env);
      
      // 各パスに合わせた処理を実行
      if (path === '/create-checkout' && request.method === 'POST') {
        return await createCheckoutSession(request, env, stripe);
      } else if (path === '/checkout-status' && request.method === 'GET') {
        return await getCheckoutStatus(request, env, stripe);
      } else if (path === '/mock-products' && request.method === 'GET') {
        return await getMockProducts();
      } else {
        return createErrorResponse('Not found', 404);
      }
    } catch (error) {
      console.error('Product API error:', error);
      return createErrorResponse(error.message);
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

/**
 * チェックアウトセッションを作成する
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function createCheckoutSession(request, env, stripe) {
  const data = await request.json();
  const { productId, productName, price, sellerId } = data;
  
  if (!productName || !price) {
    return createErrorResponse('Missing required parameters: productName, price');
  }
  
  // プラットフォーム手数料を計算 (15%)
  const platformFee = Math.round(price * 0.15);
  
  const sessionParams = {
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'jpy',
        product_data: {
          name: productName,
        },
        unit_amount: price,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${env.BASE_URL}/products/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.BASE_URL}/products/`,
  };
  
  // 販売者IDがある場合、資金の分配設定を追加
  if (sellerId) {
    sessionParams.payment_intent_data = {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerId,
      },
    };
  }
  
  const session = await stripe.checkout.sessions.create(sessionParams);
  
  return createSuccessResponse({
    sessionId: session.id,
    url: session.url,
  });
}

/**
 * チェックアウトセッションの状態を取得
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function getCheckoutStatus(request, env, stripe) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    return createErrorResponse('Missing sessionId parameter');
  }
  
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'line_items'],
  });
  
  return createSuccessResponse({
    status: session.status,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    customer: session.customer,
    lineItems: session.line_items,
  });
}

/**
 * モック商品データを取得（デモ用）
 * @return {Promise<Response>} レスポンス
 */
async function getMockProducts() {
  const mockProducts = [
    {
      id: 'prod_001',
      name: '宇宙空間ASMR',
      description: '宇宙空間の静寂と神秘的な音を組み合わせた没入型ASMRコンテンツ',
      price: 1500,
      sellerId: null, // デモ用にnull（実際の実装ではセラーIDが必要）
      thumbnail: 'https://placehold.co/600x400?text=Space+ASMR',
    },
    {
      id: 'prod_002',
      name: '森林浴音響体験',
      description: '森の中の自然音と連動した振動パターンを楽しめる没入型コンテンツ',
      price: 1200,
      sellerId: null,
      thumbnail: 'https://placehold.co/600x400?text=Forest+Sound',
    },
    {
      id: 'prod_003',
      name: '都市の夜景と音',
      description: '大都市の夜の雰囲気を音と振動で表現した没入型体験コンテンツ',
      price: 1800,
      sellerId: null,
      thumbnail: 'https://placehold.co/600x400?text=City+Night',
    },
  ];
  
  return createSuccessResponse({
    products: mockProducts,
  });
}

export default handler;
export async function handleProductRequests(request, env, ctx) {
  return await handler.fetch(request, env);
}