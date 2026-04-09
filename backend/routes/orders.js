const express = require('express');
const {
  createOrder,
  getUserOrders,
  getShopOrders,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorizeShopOwner, authorizeStaff } = require('../middleware/role');
const { body } = require('express-validator');

const router = express.Router();

// Protected routes
router.post('/', protect, [
  body('products').isArray({ min: 1 }),
  body('products.*.productId').notEmpty(),
  body('products.*.quantity').isInt({ min: 1 }),
  body('totalPrice').isNumeric()
], createOrder);

router.get('/', protect, getUserOrders);

router.get('/own', protect, authorizeShopOwner, getShopOrders);

router.put('/:id/status', protect, authorizeShopOwner, [
  body('status').isIn(['pending', 'confirmed', 'delivered'])
], updateOrderStatus);

router.get('/all', protect, authorizeStaff, getAllOrders);

module.exports = router;

