const User = require('../models/User');

// @desc    Get all users (admin dashboard)
// @route   GET /api/users
// @access  Private/Staff
const getUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json({ success: true, users });
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Staff
const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
};

// @desc    Get user stats (admin dashboard)
// @route   GET /api/users/stats
// @access  Private/Staff
const getStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const stats = {
    totalUsers,
    totalProducts,
    totalOrders,
    usersByRole: await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])
  };

  res.json({ success: true, stats });
};

module.exports = {
  getUsers,
  deleteUser,
  getStats
};

