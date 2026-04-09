const jwt = require('jsonwebtoken');

// 🔐 Protect route (verify token)
const protect = (req, res, next) => {
  let token;

  // Check token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request
      req.user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token',
    });
  }
};

// 🧑‍💼 Allow only shop owner
const authorizeShopOwner = (req, res, next) => {
  if (req.user && req.user.role === 'shopOwner') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Shop owners only',
    });
  }
};

// 👨‍💻 Allow only admin/staff (optional)
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'staff') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Admin only',
    });
  }
};

module.exports = {
  protect,
  authorizeShopOwner,
  authorizeAdmin, // optional
};