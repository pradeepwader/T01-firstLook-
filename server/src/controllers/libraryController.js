const path = require('path');
const fs = require('fs');
const Access = require('../models/Access');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { PATHS } = require('../middleware/upload');

/** User Dashboard: everything the user has unlocked */
exports.myLibrary = asyncHandler(async (req, res) => {
  const items = await Access.find({ user: req.user._id }).sort({ createdAt: -1 })
    .populate('product', 'title slug tagline category thumbnail deliveryType fileName');
  res.json({ success: true, items: items.filter((a) => a.product).map((a) => ({ id: a._id, grantedAt: a.createdAt, product: a.product })) });
});

const requireAccess = async (req, res) => {
  const owned = await Access.exists({ user: req.user._id, product: req.params.productId });
  if (!owned) { res.status(403).json({ success: false, message: 'Purchase this product to unlock it' }); return null; }
  const product = await Product.findById(req.params.productId).select('+filePath +externalUrl');
  if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return null; }
  return product;
};

/** Use Purchased Product: link products return the URL, file products return a download route */
exports.open = asyncHandler(async (req, res) => {
  const product = await requireAccess(req, res);
  if (!product) return;
  if (product.deliveryType === 'link') {
    if (!product.externalUrl) return res.status(404).json({ success: false, message: 'Content is being prepared. Please check back soon.' });
    return res.json({ success: true, type: 'link', url: product.externalUrl });
  }
  res.json({ success: true, type: 'file', url: `/api/library/${product._id}/download` });
});

exports.download = asyncHandler(async (req, res) => {
  const product = await requireAccess(req, res);
  if (!product) return;
  if (!product.filePath) return res.status(404).json({ success: false, message: 'File is not available yet' });
  const full = path.join(PATHS.FILE_DIR, path.basename(product.filePath));
  if (!fs.existsSync(full)) return res.status(404).json({ success: false, message: 'File is not available yet' });
  res.download(full, product.fileName || path.basename(full));
});
