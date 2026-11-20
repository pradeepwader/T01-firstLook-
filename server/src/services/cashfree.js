/**
 * Cashfree Payment Gateway client (REST, no SDK needed - Node >= 18 has global fetch).
 * Docs: https://docs.cashfree.com/reference/pg-new-apis-endpoints
 *
 * Flow used by T01 (see docs/PAYMENT-FLOW.md):
 *   createOrder  -> returns payment_session_id for the browser checkout
 *   getOrder     -> backend verification of the final status (never trust the browser)
 *   getPayments  -> used to detect failed attempts so the user can retry
 *   verifyWebhookSignature -> authenticates Cashfree -> server callbacks
 */
const crypto = require('crypto');
const env = require('../config/env');

const BASE = env.payment.env === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': env.payment.appId,
      'x-client-secret': env.payment.secret,
      'x-api-version': env.payment.apiVersion,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[T01] Cashfree error', res.status, data);
    const err = new Error(data.message || 'Payment gateway error. Please try again.');
    err.statusCode = 502;
    throw err;
  }
  return data;
}

exports.createOrder = ({ orderId, amount, customer, returnUrl, notifyUrl, note }) =>
  request('POST', '/orders', {
    order_id: orderId,
    order_amount: amount,
    order_currency: 'INR',
    order_note: note,
    customer_details: {
      customer_id: customer.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
    },
    order_meta: { return_url: returnUrl, ...(notifyUrl ? { notify_url: notifyUrl } : {}) },
  });

exports.getOrder = (orderId) => request('GET', `/orders/${encodeURIComponent(orderId)}`);
exports.getPayments = (orderId) => request('GET', `/orders/${encodeURIComponent(orderId)}/payments`);

// Signature = base64( HMAC-SHA256( timestamp + rawBody, clientSecret ) )
exports.verifyWebhookSignature = (rawBody, timestamp, signature) => {
  if (!rawBody || !timestamp || !signature) return false;
  const expected = crypto.createHmac('sha256', env.payment.secret).update(timestamp + rawBody).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
