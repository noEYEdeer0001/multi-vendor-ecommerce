const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');
const errorHandler = require('../middleware/errorHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array() });
  }

  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ success: false, error: 'User already exists' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user'
  });

  if (user) {
    generateToken(user._id);
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } else {
    res.status(400).json({ success: false, error: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  const validPwd = user && (await user.matchPassword(password));

  if (user && validPwd) {
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
};

// @desc    Logout user / clear cookie (client deletes token)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  res.json({ success: true, message: 'User logged out' });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};

