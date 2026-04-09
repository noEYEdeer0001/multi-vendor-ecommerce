// Order Controller - Full implementation with role logic

const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private/User
const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array() });
  }

  const { products, totalPrice } = req.body;

  // Validate stock for all items
  for (let item of products) {
    const product = await Product.findById(item.productId);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ success: false, error: `Insufficient stock for ${product?.name}` });
    }
  }

  // Create order (first item shopOwnerId for simplicity - in real app group by shop)
  const shopOwnerId = products[0].shopOwnerId || products[0].productId.shopOwnerId;

  const order = await Order.create({
    userId: req.user.id,
    products,
    totalPrice,
    shopOwnerId
  });

  // Update stock
  for (let item of products) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
  }

  res.status(201).json({ success: true, order });
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private/User
const getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user.id })
    .populate('products.productId', 'name price image')
    .populate('shopOwnerId', 'name')
    .sort('-createdAt');

  res.json({ success: true, orders });
};

// @desc    Get shop owner orders
// @route   GET /api/orders/own
// @access  Private/ShopOwner
const getShopOrders = async (req, res) => {
  const orders = await Order.find({ shopOwnerId: req.user.id })
    .populate('userId', 'name email')
    .populate('products.productId', 'name price')
    .sort('-createdAt');

  res.json({ success: true, orders });
};

// @desc    Update order status (owner/admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/ShopOwner or Staff
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findOne({ 
    _id: req.params.id, 
    shopOwnerId: req.user.id 
  });

  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  order.status = status;
  await order.save();

  res.json({ success: true, order });
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders/all
// @access  Private/Staff
const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate('userId', 'name email')
    .populate('shopOwnerId', 'name')
    .populate('products.productId', 'name price')
    .sort('-createdAt');

  res.json({ success: true, orders });
};

module.exports = {
  createOrder,
  getUserOrders,
  getShopOrders,
  updateOrderStatus,
  getAllOrders
};

