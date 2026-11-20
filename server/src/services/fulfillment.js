/**
 * Order fulfilment: the single place where an order becomes PAID and access is granted.
 * Idempotent - safe to call from the verify endpoint AND the webhook at the same time.
 */
const env = require('../config/env');
const Order = require('../models/Order');
const Access = require('../models/Access');
const Product = require('../models/Product');
const User = require('../models/User');
const cashfree = require('./cashfree');
const { sendEmail, templates } = require('./mailer');

// Confirm Order -> Create Product Access
async function fulfillOrder(orderId, { cfPaymentId, paymentMethod } = {}) {
  const set = { status: 'PAID', paidAt: new Date() };
  if (cfPaymentId) set.cfPaymentId = cfPaymentId;
  if (paymentMethod) set.paymentMethod = paymentMethod;
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: { $ne: 'PAID' } }, // atomic guard: only the first caller wins
    { $set: set, $unset: { failureReason: 1 } },
    { new: true }
  );
  if (!order) return Order.findById(orderId); // already fulfilled

  await Access.updateOne(
    { user: order.user, product: order.product },
    { $setOnInsert: { user: order.user, product: order.product, order: order._id } },
    { upsert: true }
  );
  await Product.updateOne({ _id: order.product }, { $inc: { salesCount: 1 } });

  User.findById(order.user).then((u) => {
    if (!u || order.amount === 0) return;
    sendEmail({
      to: u.email,
      subject: `Order confirmed - ${order.productTitle}`,
      html: templates.orderConfirmed(u.name, order.productTitle, order.amount, order.orderId, `${env.clientUrl}/dashboard`),
    });
  });
  return order;
}

// Payment Verified? (backend verification against Cashfree)
async function syncOrderStatus(order) {
  if (order.status === 'PAID' || order.gateway !== 'cashfree') return order;

  const cf = await cashfree.getOrder(order.orderId);

  if (cf.order_status === 'PAID') {
    if (Number(cf.order_amount) !== Number(order.amount)) {
      order.status = 'FAILED';
      order.failureReason = 'Amount mismatch';
      return order.save(); // never grant access on a tampered amount
    }
    const payments = await cashfree.getPayments(order.orderId).catch(() => []);
    const ok = Array.isArray(payments) ? payments.find((p) => p.payment_status === 'SUCCESS') : null;
    return fulfillOrder(order._id, {
      cfPaymentId: ok?.cf_payment_id?.toString(),
      paymentMethod: ok ? Object.keys(ok.payment_method || {})[0] : undefined,
    });
  }

  // Not paid yet: look for a failed attempt so the UI can offer "Retry"
  const payments = await cashfree.getPayments(order.orderId).catch(() => []);
  const failed = Array.isArray(payments) && payments.some((p) => ['FAILED', 'USER_DROPPED', 'CANCELLED'].includes(p.payment_status));
  if (failed || ['EXPIRED', 'TERMINATED'].includes(cf.order_status)) {
    if (order.status === 'PENDING') {
      order.status = 'FAILED';
      order.failureReason = failed ? 'Payment attempt failed' : `Order ${cf.order_status.toLowerCase()}`;
      await order.save();
    }
  }
  return order;
}

module.exports = { fulfillOrder, syncOrderStatus };
