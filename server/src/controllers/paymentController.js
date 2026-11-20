const Order = require('../models/Order');
const cashfree = require('../services/cashfree');
const { syncOrderStatus } = require('../services/fulfillment');

/**
 * Cashfree -> server webhook. Mounted with express.raw() so the signature can be checked
 * against the exact bytes Cashfree sent. We never trust the payload alone: after the
 * signature passes we re-verify the order status with Cashfree before granting access.
 */
exports.webhook = async (req, res) => {
  try {
    const raw = req.body instanceof Buffer ? req.body.toString('utf8') : '';
    const valid = cashfree.verifyWebhookSignature(raw, req.headers['x-webhook-timestamp'], req.headers['x-webhook-signature']);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid signature' });

    const event = JSON.parse(raw);
    const orderId = event?.data?.order?.order_id;
    if (orderId) {
      const order = await Order.findOne({ orderId });
      if (order) await syncOrderStatus(order);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[T01] Webhook error:', err.message);
    res.status(500).json({ success: false }); // Cashfree retries on non-2xx
  }
};
