const User = require('../models/User');

const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not authorized' });
    }

    // Check if user has required role
    const user = await User.findById(req.user.id).select('role');
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({ success: false, error: `User role ${user.role} is not authorized to access this route` });
    }

    req.user.role = user.role;
    next();
  };
};

// Role helpers
const authorizeShopOwner = authorize('shopOwner');
const authorizeStaff = authorize('staff');
const authorizeStaffOrOwner = authorize('staff', 'shopOwner');

module.exports = { authorize, authorizeShopOwner, authorizeStaff, authorizeStaffOrOwner };

