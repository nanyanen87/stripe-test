// src/handlers/connect.js
import { initStripeFromEnv, createSuccessResponse, createErrorResponse } from '../utils/stripe-client';

/**
 * Connect APIリクエストのハンドラ
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Object} ctx - コンテキスト
 * @return {Promise<Response>} レスポンス
 */
export async function handleConnectRequests(request, env, ctx) {
  // URLから操作を判断
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/connect', '');
  
  try {
    const stripe = initStripeFromEnv(env);
    
    // 各パスに合わせた処理を実行
    if (path === '/create-account' && request.method === 'POST') {
      return await createConnectAccount(request, env, stripe);
    } else if (path === '/account-status' && request.method === 'GET') {
      return await getAccountStatus(request, env, stripe);
    } else if (path === '/create-account-link' && request.method === 'POST') {
      return await createAccountLink(request, env, stripe);
    } else if (path === '/create-login-link' && request.method === 'POST') {
      return await createLoginLink(request, env, stripe);
    } else {
      return createErrorResponse('Not found', 404);
    }
  } catch (error) {
    console.error('Connect API error:', error);
    return createErrorResponse(error.message);
  }
}

/**
 * Connectアカウントを作成する
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function createConnectAccount(request, env, stripe) {
  const data = await request.json();
  const { email, name } = data;
  
  // Express アカウントを作成
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'JP',
    email,
    business_type: 'individual',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      name: name || 'Stremix Seller',
      url: `${env.BASE_URL}/connect/seller`,
    },
  });
  
  return createSuccessResponse({
    accountId: account.id,
    details_submitted: account.details_submitted,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
  });
}

/**
 * アカウントのステータスを取得する
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function getAccountStatus(request, env, stripe) {
  const url = new URL(request.url);
  const accountId = url.searchParams.get('accountId');
  
  if (!accountId) {
    return createErrorResponse('Missing accountId parameter');
  }
  
  const account = await stripe.accounts.retrieve(accountId);
  
  return createSuccessResponse({
    accountId: account.id,
    details_submitted: account.details_submitted,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
  });
}

/**
 * アカウントリンクを作成する（オンボーディング用）
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function createAccountLink(request, env, stripe) {
  const data = await request.json();
  const { accountId } = data;
  
  if (!accountId) {
    return createErrorResponse('Missing accountId parameter');
  }
  
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${env.BASE_URL}/connect/refresh`,
    return_url: `${env.BASE_URL}/connect/dashboard`,
    type: 'account_onboarding',
  });
  
  return createSuccessResponse({
    url: accountLink.url,
  });
}

/**
 * ダッシュボードログインリンクを作成する
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 * @return {Promise<Response>} レスポンス
 */
async function createLoginLink(request, env, stripe) {
  const data = await request.json();
  const { accountId } = data;
  
  if (!accountId) {
    return createErrorResponse('Missing accountId parameter');
  }
  
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  
  return createSuccessResponse({
    url: loginLink.url,
  });
}