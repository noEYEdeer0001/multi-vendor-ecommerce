const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
], registerUser);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], loginUser);

// Protected route
router.post('/logout', protect, logoutUser);

module.exports = router;

