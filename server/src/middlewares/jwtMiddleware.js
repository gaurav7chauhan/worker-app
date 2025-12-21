import { verifyAccessToken } from '../utils/jwt.js';
import { isAccessJtiBlacklisted } from '../services/redisToken.js';
import { AppError } from '../utils/apiError.js';

export const jwtVerify = async (req, res, next) => {
  try {
    // auth header parsing
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return next(new AppError('Missing access token', { status: 401 }));
    }

    const token = auth.split(' ')[1];

    // token verification
    const decoded = verifyAccessToken(token);

    // token revocation check
    if (decoded?.jti && (await isAccessJtiBlacklisted(decoded.jti))) {
      return next(new AppError('Token revoked', { status: 401 }));
    }

    // attach auth user
    req.auth = { _id: decoded._id };
    return next();
  } catch (e) {
    return next(new AppError('Unauthorized token', { status: 401 }));
  }
};
