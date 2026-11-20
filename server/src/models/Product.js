const mongoose = require('mongoose');

const CATEGORIES = ['roadmap', 'guide', 'interview', 'skills', 'planning', 'other'];

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, trim: true, maxlength: 200, default: '' },
    description: { type: String, trim: true, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'guide' },
    price: { type: Number, required: true, min: 0 }, // INR (rupees). 0 = free resource
    compareAtPrice: { type: Number, min: 0, default: 0 },
    thumbnail: { type: String, default: '' },
    features: [{ type: String, trim: true }],
    // How the buyer receives the product after payment
    deliveryType: { type: String, enum: ['file', 'link'], default: 'link' },
    filePath: { type: String, select: false }, // private file in server/storage/products
    fileName: { type: String, default: '' },
    externalUrl: { type: String, select: false }, // e.g. Drive / Notion / course link
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.virtual('isFree').get(function () {
  return this.price === 0;
});
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

productSchema.statics.CATEGORIES = CATEGORIES;
module.exports = mongoose.model('Product', productSchema);
