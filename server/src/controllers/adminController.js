const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { syncOrderStatus } = require('../services/fulfillment');

const paginate = (q) => {
  const limit = Math.min(parseInt(q.limit, 10) || 20, 100);
  const page = Math.max(parseInt(q.page, 10) || 1, 1);
  return { limit, skip: (page - 1) * limit, page };
};
const esc = (s) => s.toString().slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.stats = asyncHandler(async (req, res) => {
  const [users, products, paidAgg, byStatus, recent] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.aggregate([{ $match: { status: 'PAID' } }, { $group: { _id: null, revenue: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(8).populate('user', 'name email').select('orderId productTitle amount status createdAt user'),
  ]);
  res.json({
    success: true,
    stats: {
      users,
      products,
      revenue: paidAgg[0]?.revenue || 0,
      paidOrders: paidAgg[0]?.count || 0,
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      recentOrders: recent,
    },
  });
});

/* Manage Users */
exports.users = asyncHandler(async (req, res) => {
  const { limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.q) {
    const rx = { $regex: esc(req.query.q), $options: 'i' };
    filter.$or = [{ name: rx }, { email: rx }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, total, users });
});

exports.toggleUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, user });
});

/* Manage Orders and Payments */
exports.orders = asyncHandler(async (req, res) => {
  const { limit, skip } = paginate(req.query);
  const filter = {};
  if (['PENDING', 'PAID', 'FAILED', 'CANCELLED'].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.q) filter.orderId = { $regex: esc(req.query.q), $options: 'i' };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, total, orders });
});

// Re-check a stuck order with the gateway
exports.verifyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const updated = await syncOrderStatus(order);
  res.json({ success: true, status: updated.status });
});
