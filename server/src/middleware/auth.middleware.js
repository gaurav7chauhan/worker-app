import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/user.model';

export const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'No access token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new ApiError(401, 'Invalid token');
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid token', [error.message]);
  }
});
