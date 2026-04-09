const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private/User
const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ userId: req.user.id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId: req.user.id, products: [productId] });
  } else if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.json({ success: true, message: 'Added to wishlist' });
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private/User
const removeFromWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ userId: req.user.id });

  if (wishlist) {
    wishlist.products = wishlist.products.filter(id => id.toString() !== req.params.productId);
    await wishlist.save();
  }

  res.json({ success: true, message: 'Removed from wishlist' });
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private/User
const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ userId: req.user.id })
    .populate('products', 'name price image category shopOwnerId');

  res.json({ success: true, wishlist: wishlist || { products: [] } });
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist
};

