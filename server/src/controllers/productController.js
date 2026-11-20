const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Access = require('../models/Access');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');
const { PATHS } = require('../middleware/upload');

/* ---------------- Public: Explore Products / Product Details ---------------- */

exports.list = asyncHandler(async (req, res) => {
  const { category, q, featured, limit = 24, page = 1 } = req.query;
  const filter = { isPublished: true };
  if (category && Product.CATEGORIES.includes(category)) filter.category = category;
  if (featured === 'true') filter.isFeatured = true;
  if (q) filter.title = { $regex: q.toString().slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const lim = Math.min(parseInt(limit, 10) || 24, 60);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * lim;
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(lim),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, total, products: items });
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isPublished: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

/* ---------------- Admin: Manage Products ---------------- */

const parseFeatures = (v) =>
  (Array.isArray(v) ? v : (v || '').toString().split('\n')).map((s) => s.trim()).filter(Boolean).slice(0, 12);

const removeFile = (dir, name) => {
  if (!name) return;
  const target = path.join(dir, path.basename(name)); // basename blocks path traversal
  fs.promises.unlink(target).catch(() => {});
};

const applyBody = (product, b, files) => {
  ['title', 'tagline', 'description', 'category', 'deliveryType'].forEach((k) => { if (b[k] !== undefined) product[k] = b[k]; });
  if (b.price !== undefined) product.price = Number(b.price);
  if (b.compareAtPrice !== undefined) product.compareAtPrice = Number(b.compareAtPrice) || 0;
  if (b.features !== undefined) product.features = parseFeatures(b.features);
  if (b.isPublished !== undefined) product.isPublished = b.isPublished === 'true' || b.isPublished === true;
  if (b.isFeatured !== undefined) product.isFeatured = b.isFeatured === 'true' || b.isFeatured === true;
  if (b.externalUrl !== undefined) product.externalUrl = b.externalUrl.trim();

  if (files?.thumbnail?.[0]) {
    if (product.thumbnail) removeFile(PATHS.THUMB_DIR, product.thumbnail);
    product.thumbnail = `/uploads/thumbnails/${files.thumbnail[0].filename}`;
  }
  if (files?.file?.[0]) {
    removeFile(PATHS.FILE_DIR, product.filePath);
    product.filePath = files.file[0].filename;
    product.fileName = files.file[0].originalname;
  }
};

exports.adminList = asyncHandler(async (req, res) => {
  const products = await Product.find().select('+filePath +externalUrl').sort({ createdAt: -1 });
  res.json({ success: true, products });
});

exports.create = asyncHandler(async (req, res) => {
  const product = new Product({ title: req.body.title, price: Number(req.body.price) });
  applyBody(product, req.body, req.files);
  const base = slugify(product.title);
  product.slug = (await Product.exists({ slug: base })) ? `${base}-${Date.now().toString(36)}` : base;
  await product.save();
  res.status(201).json({ success: true, product });
});

exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('+filePath +externalUrl');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  applyBody(product, req.body, req.files);
  await product.save();
  res.json({ success: true, product });
});

exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('+filePath');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  // Never destroy something customers have paid for - just unpublish it.
  const sold = (await Order.exists({ product: product._id, status: 'PAID' })) || (await Access.exists({ product: product._id }));
  if (sold) {
    product.isPublished = false;
    await product.save();
    return res.json({ success: true, message: 'Product has buyers, so it was unpublished instead of deleted' });
  }
  removeFile(PATHS.THUMB_DIR, product.thumbnail);
  removeFile(PATHS.FILE_DIR, product.filePath);
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});
