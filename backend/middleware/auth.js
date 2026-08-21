const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tms_secret_key_2024');
    const user = await User.findById(decoded.userId).populate('role');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if user is SuperAdmin
const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role || req.user.role.name !== 'Superadmin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check specific roles
const hasRole = (...roles) => {
  return (req, res, next) => {
    const roleName = req.user?.role?.name;
    if (!roleName || !roles.includes(roleName)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { auth, isSuperAdmin, hasRole };
