const mongoose = require('mongoose');

// Editable landing-page content ("Manage Landing Pages and Content")
const contentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "home"
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);
