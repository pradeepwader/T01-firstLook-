const mongoose = require('mongoose');

// Flow: PENDING (created at checkout) -> PAID (verified) | FAILED | CANCELLED
const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true }, // sent to Cashfree as order_id
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productTitle: { type: String, required: true }, // snapshot
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'], default: 'PENDING', index: true },
    gateway: { type: String, enum: ['cashfree', 'mock', 'free'], required: true },
    cfOrderId: String,
    paymentSessionId: { type: String, select: false },
    cfPaymentId: String,
    paymentMethod: String,
    failureReason: String,
    paidAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
