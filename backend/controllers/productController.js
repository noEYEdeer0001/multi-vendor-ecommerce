const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Get all products (with filters/search/sort/pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const keyword = req.query.search
      ? {
          name: {
            $regex: req.query.search,
            $options: 'i',
          },
        }
      : {};

    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};

    const priceFilter =
      req.query.minPrice || req.query.maxPrice
        ? {
            price: {
              $gte: parseInt(req.query.minPrice || 0),
              $lte: parseInt(req.query.maxPrice || 999999),
            },
          }
        : {};

    const sortField = req.query.sort
      ? req.query.sort.split(':')[0]
      : 'createdAt';

    const sortOrder =
      req.query.sort && req.query.sort.split(':')[1] === 'desc'
        ? -1
        : 1;

    const query = { ...keyword, ...categoryFilter, ...priceFilter };

    const products = await Product.find(query)
      .populate('shopOwnerId', 'name email')
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip(skip);

    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      count,
      page,
      pages: Math.ceil(count / limit),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'shopOwnerId',
      'name email'
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shop owner products
// @route   GET /api/products/own
// @access  Private/ShopOwner
const getOwnProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      shopOwnerId: req.user.id,
    }).populate('shopOwnerId', 'name');

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/ShopOwner
const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, errors: errors.array() });
    }

    const product = new Product({
      ...req.body,
      shopOwnerId: req.user.id,
    });

    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      product: createdProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/ShopOwner
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shopOwnerId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or not authorized',
      });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/ShopOwner
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      shopOwnerId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or not authorized',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById, // ✅ IMPORTANT (fixes your error)
  getOwnProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};