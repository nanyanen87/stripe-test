// src/api/subscription-api.js
import { initStripeFromEnv, createSuccessResponse, createErrorResponse } from '../utils/stripe-client';

/**
 * サブスクリプション関連APIのリクエストハンドラ
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @return {Promise<Response>} レスポンス
 */
export default {
  async fetch(request, env) {
    // CORSヘッダーを設定
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest();
    }
    
    // URLから操作を判断
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/subscription', '');
    
    try {
      const stripe = initStripeFromEnv(env);
      
      // 各パスに合わせた処理を実行
      if (path === '/create-customer' && request.method === 'POST') {
        return await createCustomer(request, env, stripe);
      } else if (path === '/create-subscription' && request.method === 'POST') {
        return await createSubscription(request, env, stripe);
      } else if (path === '/create-portal' && request.method === 'POST') {
        return await createCustomerPortal(request, env, stripe);
      } else if (path === '/plans' && request.method === 'GET') {
        return await getSubscriptionPlans(env, stripe);
      } else {
        return createErrorResponse('Not found', 404);
      }
    } catch (error) {
      console.error('Subscription API error:', error);
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
 * Stripe顧客を作成する
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function createCustomer(request, env, stripe) {
  const data = await request.json();
  const { email, name } = data;
  
  if (!email) {
    return createErrorResponse('Missing required parameter: email');
  }
  
  const customer = await stripe.customers.create({
    email,
    name: name || '',
  });
  
  return createSuccessResponse({
    customerId: customer.id,
  });
}

/**
 * サブスクリプションを作成する
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function createSubscription(request, env, stripe) {
  const data = await request.json();
  const { customerId, priceId } = data;
  
  if (!customerId || !priceId) {
    return createErrorResponse('Missing required parameters: customerId, priceId');
  }
  
  // チェックアウトセッションを作成（サブスクリプションモード）
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${env.BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.BASE_URL}/subscription/`,
  });
  
  return createSuccessResponse({
    sessionId: session.id,
    url: session.url,
  });
}

/**
 * 顧客ポータルを作成する
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function createCustomerPortal(request, env, stripe) {
  const data = await request.json();
  const { customerId } = data;
  
  if (!customerId) {
    return createErrorResponse('Missing required parameter: customerId');
  }
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.BASE_URL}/subscription/manage`,
  });
  
  return createSuccessResponse({
    url: session.url,
  });
}

/**
 * サブスクリプションプランの一覧を取得
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function getSubscriptionPlans(env, stripe) {
  // 注意: このメソッドは実際のStripeプランを取得するようにカスタマイズする必要があります
  // ここではモックデータを返しています
  
  // モックプランデータ（実際の実装では、Stripeから取得したプランを返す）
  const plans = [
    {
      id: 'plan_standard',
      name: 'リミックス スタンダード',
      description: '基本的なリミックス機能が利用可能なプラン',
      price: 980,
      interval: 'month',
      features: [
        '基本的なリミックス機能',
        'オフライン再生',
        '標準音質',
      ],
    },
    {
      id: 'plan_premium',
      name: 'リミックス プレミアム',
      description: 'すべてのリミックス機能が利用可能な上位プラン',
      price: 1980,
      interval: 'month',
      features: [
        'すべてのリミックス機能',
        'オフライン再生',
        '高音質',
        'プライオリティサポート',
      ],
    },
  ];
  
  return createSuccessResponse({
    plans,
  });
}

export async function handleSubscriptionRequests(request, env, ctx) {
  // ctxは未使用ですが、index.jsの呼び出しに合わせて追加
  return await exports.default.fetch(request, env);
}