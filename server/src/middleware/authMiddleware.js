import { verifyRefreshToken } from '../utils/jwt.js';
import { User } from '../models/userModel.js';

export const authToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const decoded = await verifyRefreshToken(token);

    if (!decoded || !decoded._id) {
      return res
        .status(401)
        .json({ message: 'Invalid token payload or missing _id' });
    }

    const user = await User.findById(decoded._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isBlocked)
      return res.status(403).json({ message: 'User account is blocked' });

    req.user = user;

    next();
  } catch (err) {
    // 6. Map specific JWT errors

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token has expired' });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (err.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token is not active yet' });
    }

    return res.status(401).json({ message: `Invalid token, ${[err.message]}` });
  }
};
