const mongoose = require('mongoose');

// "Create Product Access" step of the flow: one record per (user, product)
const accessSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  },
  { timestamps: true }
);
accessSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Access', accessSchema);
