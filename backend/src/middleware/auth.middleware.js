import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } 
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: `Role (${user.role}) is not authorized to access this route` });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account must be verified to perform this action. Please verify your email first.' });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    }
    next();
  } catch (error) {
    next();
  }
};

