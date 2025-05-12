// src/webhooks/stripe-webhook.js
import { initStripeFromEnv, verifyWebhookSignature, createSuccessResponse, createErrorResponse } from '../utils/stripe-client';

/**
 * Stripeウェブフックのハンドラ
 * @param {Request} request - リクエストオブジェクト
 * @param {Object} env - 環境変数
 * @return {Promise<Response>} レスポンス
 */
export default {
  async fetch(request, env) {
    // POSTメソッド以外は受け付けない
    if (request.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }
    
    try {
      const stripe = initStripeFromEnv(env);
      
      // ウェブフック署名の検証
      const event = await verifyWebhookSignature(
        request, 
        env.STRIPE_WEBHOOK_SECRET, 
        stripe
      );
      
      // イベントタイプに基づいて処理
      console.log(`Processing webhook event: ${event.type}`);
      
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object, env, stripe);
          break;
          
        case 'invoice.paid':
          await handleInvoicePaid(event.data.object, env, stripe);
          break;
          
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object, env, stripe);
          break;
          
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object, env, stripe);
          break;
          
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object, env, stripe);
          break;
          
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object, env, stripe);
          break;
          
        case 'account.updated':
          await handleAccountUpdated(event.data.object, env, stripe);
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      // ウェブフックは常に200 OKを返す（Stripeのベストプラクティス）
      return createSuccessResponse({ received: true });
      
    } catch (error) {
      console.error('Webhook error:', error);
      return createErrorResponse(error.message, 400);
    }
  }
};

/**
 * checkout.session.completed イベントの処理
 * @param {Object} session - チェックアウトセッションオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 */
async function handleCheckoutSessionCompleted(session, env, stripe) {
  console.log('Checkout completed:', session.id);
  
  // セッションモードに応じた処理
  if (session.mode === 'payment') {
    // 一回限りの購入処理
    console.log(`Payment success! Customer: ${session.customer}, Amount: ${session.amount_total}`);
    
    // 実際の実装では：
    // - 購入履歴データベースへの記録
    // - 購入完了メールの送信
    // - コンテンツへのアクセス権付与
    // などを行う
    
  } else if (session.mode === 'subscription') {
    // サブスクリプション購入処理
    console.log(`Subscription started! Customer: ${session.customer}`);
    
    // 実際の実装では：
    // - ユーザーのサブスクリプションステータス更新
    // - サブスクリプション開始メールの送信
    // - サブスクリプション機能の有効化
    // などを行う
  }
}

/**
 * invoice.paid イベントの処理
 * @param {Object} invoice - 請求書オブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 */
async function handleInvoicePaid(invoice, env, stripe) {
  console.log(`Invoice paid: ${invoice.id}, Customer: ${invoice.customer}`);
  
  // サブスクリプション支払いの場合
  if (invoice.subscription) {
    // 実際の実装では：
    // - サブスクリプション更新の記録
    // - 支払い完了メールの送信
    // などを行う
  }
}

/**
 * invoice.payment_failed イベントの処理
 * @param {Object} invoice - 請求書オブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 */
async function handleInvoicePaymentFailed(invoice, env, stripe) {
  console.log(`Invoice payment failed: ${invoice.id}, Customer: ${invoice.customer}`);
  
  // 実際の実装では：
  // - ユーザーへの支払い失敗通知
  // - 再試行スケジュールの確認
  // - 一定回数失敗後のサブスクリプション停止
  // などを行う
}

/**
 * customer.subscription.created イベントの処理
 * @param {Object} subscription - サブスクリプションオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 */
async function handleSubscriptionCreated(subscription, env, stripe) {
  console.log(`Subscription created: ${subscription.id}, Status: ${subscription.status}`);
  
  // 実際の実装では：
  // - ユーザーDBのサブスクリプションステータス更新
  // - サブスクリプション開始メールの送信
  // などを行う
}

/**
 * customer.subscription.updated イベントの処理
 * @param {Object} subscription - サブスクリプションオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 */
async function handleSubscriptionUpdated(subscription, env, stripe) {
  console.log(`Subscription updated: ${subscription.id}, Status: ${subscription.status}`);
  
  // 実際の実装では：
  // - ユーザーDBのサブスクリプションステータス更新
  // - プラン変更の場合はその記録と通知
  // - キャンセル予定の場合はその記録と通知
  // などを行う
}

/**
 * customer.subscription.deleted イベントの処理
 * @param {Object} subscription - サブスクリプションオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 */
async function handleSubscriptionDeleted(subscription, env, stripe) {
  console.log(`Subscription deleted: ${subscription.id}`);
  
  // 実際の実装では：
  // - ユーザーDBのサブスクリプションステータス更新
  // - サブスクリプション終了メールの送信
  // - サブスクリプション機能の無効化
  // などを行う
}

/**
 * account.updated イベントの処理
 * @param {Object} account - Connectアカウントオブジェクト
 * @param {Object} env - 環境変数
 * @param {Stripe} stripe - Stripeインスタンス
 */
async function handleAccountUpdated(account, env, stripe) {
  console.log(`Connect account updated: ${account.id}, Status changes: ${JSON.stringify({
    details_submitted: account.details_submitted,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled
  })}`);
  
  // 実際の実装では：
  // - 販売者DBのアカウントステータス更新
  // - 特定の状態変化に対する通知
  // などを行う
}

export async function handleWebhooks(request, env, ctx) {
  // ctxは未使用ですが、index.jsの呼び出しに合わせて追加
  return await exports.default.fetch(request, env);
}