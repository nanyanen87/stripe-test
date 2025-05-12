// src/utils/stripe-client.js
import Stripe from 'stripe';

/**
 * Stripeクライアントを初期化して返す
 * @param {string} apiKey - Stripe APIキー
 * @return {Stripe} Stripeインスタンス
 */
export function getStripeClient(apiKey) {
  return new Stripe(apiKey, {
    apiVersion: '2023-10-16', // 最新のAPI versionを使用
    httpClient: Stripe.createFetchHttpClient(), // fetchを使用
  });
}

/**
 * 環境変数からStripeクライアントを初期化
 * @param {Object} env - Workerの環境変数
 * @return {Stripe} Stripeインスタンス
 */
export function initStripeFromEnv(env) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return getStripeClient(env.STRIPE_SECRET_KEY);
}

/**
 * Webフックの署名を検証する
 * @param {Request} request - リクエストオブジェクト
 * @param {string} secret - Webhookシークレット
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Object>} 検証済みイベントオブジェクト
 */
export async function verifyWebhookSignature(request, secret, stripe) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    throw new Error('No signature header found');
  }
  
  const body = await request.text();
  return stripe.webhooks.constructEvent(body, signature, secret);
}

/**
 * エラーレスポンスを作成
 * @param {string} message - エラーメッセージ
 * @param {number} status - HTTPステータスコード
 * @return {Response} レスポンスオブジェクト
 */
export function createErrorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * 成功レスポンスを作成
 * @param {Object} data - レスポンスデータ
 * @return {Response} レスポンスオブジェクト
 */
export function createSuccessResponse(data) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}