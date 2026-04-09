const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Index for unique user wishlist
wishlistSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);

