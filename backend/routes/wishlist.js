const express = require('express');
const { protect } = require('../middleware/auth');
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController');
const { body } = require('express-validator');

const router = express.Router();

router.post('/', protect, [
  body('productId').notEmpty()
], addToWishlist);

router.delete('/:productId', protect, removeFromWishlist);

router.get('/', protect, getWishlist);

module.exports = router;

