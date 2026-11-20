const crypto = require('crypto');
const { body } = require('express-validator');
const env = require('../config/env');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Access = require('../models/Access');
const asyncHandler = require('../utils/asyncHandler');
const cashfree = require('../services/cashfree');
const { fulfillOrder, syncOrderStatus } = require('../services/fulfillment');

exports.checkoutRules = [body('productId').isMongoId().withMessage('Invalid product')];

const newOrderId = () => `T01_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

/**
 * Checkout -> Create Pending Order -> Online Payment
 * Backend re-reads the price from the database; the browser never sends an amount.
 */
exports.checkout = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.body.productId, isPublished: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  if (await Access.exists({ user: req.user._id, product: product._id })) {
    return res.status(409).json({ success: false, message: 'You already own this product', code: 'OWNED' });
  }

  // Older unfinished attempts for the same product are closed (a new one is created below)
  await Order.updateMany({ user: req.user._id, product: product._id, status: { $in: ['PENDING', 'FAILED'] } }, { status: 'CANCELLED' });

  const base = {
    orderId: newOrderId(),
    user: req.user._id,
    product: product._id,
    productTitle: product.title,
    amount: product.price,
  };

  // Free resource: no payment step
  if (product.price === 0) {
    const order = await Order.create({ ...base, gateway: 'free' });
    await fulfillOrder(order._id);
    return res.status(201).json({ success: true, free: true, orderId: order.orderId });
  }

  if (env.payment.mode === 'mock') {
    const order = await Order.create({ ...base, gateway: 'mock' });
    return res.status(201).json({ success: true, mode: 'mock', orderId: order.orderId });
  }

  // Cashfree: create the gateway order first, then store it
  const order = new Order({ ...base, gateway: 'cashfree' });
  const cf = await cashfree.createOrder({
    orderId: order.orderId,
    amount: product.price,
    note: product.title.slice(0, 100),
    customer: { id: req.user._id.toString(), name: req.user.name, email: req.user.email, phone: req.user.phone },
    returnUrl: `${env.clientUrl}/payment/status?order_id=${order.orderId}`,
    notifyUrl: env.serverPublicUrl.startsWith('https://') ? `${env.serverPublicUrl}/api/payments/webhook` : undefined,
  });
  order.cfOrderId = cf.cf_order_id?.toString();
  order.paymentSessionId = cf.payment_session_id;
  await order.save();

  res.status(201).json({
    success: true,
    mode: 'cashfree',
    cashfreeEnv: env.payment.env,
    orderId: order.orderId,
    paymentSessionId: cf.payment_session_id,
  });
});

const ownOrder = async (req) => {
  const order = await Order.findOne({ orderId: req.params.orderId, user: req.user._id });
  return order;
};

/** Payment Verified? - called when the user returns from the gateway (and on retry) */
exports.status = asyncHandler(async (req, res) => {
  let order = await ownOrder(req);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order = await syncOrderStatus(order);
  const product = await Product.findById(order.product).select('slug title');
  res.json({
    success: true,
    order: {
      orderId: order.orderId,
      status: order.status,
      amount: order.amount,
      productTitle: order.productTitle,
      productSlug: product?.slug,
      productId: order.product,
      failureReason: order.failureReason,
    },
  });
});

exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100)
    .select('orderId productTitle amount status gateway paidAt createdAt');
  res.json({ success: true, orders });
});

/** Local testing only (PAYMENT_MODE=mock): simulates the gateway result. */
exports.mockPay = asyncHandler(async (req, res) => {
  if (env.payment.mode !== 'mock') return res.status(404).json({ success: false, message: 'Not found' });
  const order = await ownOrder(req);
  if (!order || order.gateway !== 'mock') return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.status === 'PAID') return res.json({ success: true, status: 'PAID' });

  if (req.body.success) {
    await fulfillOrder(order._id, { cfPaymentId: `MOCK_${Date.now()}`, paymentMethod: 'mock' });
    return res.json({ success: true, status: 'PAID' });
  }
  order.status = 'FAILED';
  order.failureReason = 'Simulated failure';
  await order.save();
  res.json({ success: true, status: 'FAILED' });
});
