const express = require('express');
const {
  getProducts,
  getProductById,
  getOwnProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { protect, authorizeShopOwner } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// 🔓 Public routes
router.get('/', getProducts);

// ⚠️ IMPORTANT: keep /own BEFORE /:id
router.get('/own', protect, authorizeShopOwner, getOwnProducts);

// 🔓 Get single product
router.get('/:id', getProductById);

// 🛒 Shop Owner routes
router.post(
  '/',
  [
    protect,
    authorizeShopOwner,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('image').isURL().withMessage('Image must be a valid URL'),
    body('stock').isNumeric().withMessage('Stock must be a number')
  ],
  createProduct
);

router.put('/:id', protect, authorizeShopOwner, updateProduct);

router.delete('/:id', protect, authorizeShopOwner, deleteProduct);

module.exports = router;