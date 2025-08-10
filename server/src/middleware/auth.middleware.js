import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/user.model';

export const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // 2. Split and validate
  const [scheme, token] = authHeader.split(' ');

  if (!scheme || !token) {
    throw new ApiError(
      401,
      'Invalid Authorization header format, expected "Bearer <token>"'
    );
  }

  if (scheme.toLowerCase() !== 'bearer') {
    throw new ApiError(401, 'Authorization scheme must be Bearer');
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new ApiError(401, 'Invalid token payload');
    }

    const user = await User.findById(decoded._id).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isBlocked) throw new ApiError(403, 'User account is blocked');

    req.user = user;

    next();
  } catch (err) {
    // 6. Map specific JWT errors

    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired');
    }

    if (err.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    }

    if (err.name === 'NotBeforeError') {
      throw new ApiError(401, 'Token is not active yet');
    }

    throw new ApiError(401, 'Invalid token', [err.message]);
  }
});
