import { verifyAccessToken } from '../services/jwt.js';
import { AppError } from '../utils/apiError.js';

export const jwtVerify = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return next(new AppError('Missing access token', { status: 401 }));
    }
    const token = auth.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.auth = { _id: decoded._id };
    return next();
  } catch (e) {
    return next(
      new AppError('Invalid or expired access token', { status: 401 })
    );
  }
};
