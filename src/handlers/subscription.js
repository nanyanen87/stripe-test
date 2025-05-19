// src/api/subscription-api.js
import { initStripeFromEnv, createSuccessResponse, createErrorResponse } from '../utils/stripe-client';

/**
 * サブスクリプション関連APIのリクエストハンドラ
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
  try {
    // Stripeから実際の価格リストを取得
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      limit: 100,
      expand: ['data.product']
    });

    // 価格が見つからない場合
    if (prices.data.length === 0) {
      return createErrorResponse('サブスクリプションプランが見つかりません。Stripeダッシュボードで商品と価格を作成してください。');
    }

    // Stripeの価格情報から必要な形式にマッピング
    const plans = prices.data.map(price => {
      const product = price.product;
      // 商品のメタデータから機能リストを取得（もし設定されていれば）
      const features = [];
      if (product.metadata && product.metadata.features) {
        features.push(...product.metadata.features.split(',').map(f => f.trim()));
      } else {
        // デフォルトの機能リスト
        features.push('基本機能');
      }

      return {
        id: price.id,
        name: product.name,
        description: product.description || '詳細情報はありません',
        price: price.unit_amount,
        interval: price.recurring.interval,
        features: features
      };
    });

    return createSuccessResponse({
      plans,
    });
  } catch (error) {
    console.error('Error fetching plans from Stripe:', error);
    return createErrorResponse('プランの取得中にエラーが発生しました: ' + error.message);
  }
}

export default handler;
export async function handleSubscriptionRequests(request, env, ctx) {
  return await handler.fetch(request, env);
}