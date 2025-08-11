import { cookieOptions } from './cookieOptions';
import { ApiResponse } from './apiResponse';
import { ApiError } from './apiError';
import { verifyRefreshToken } from './jwt';
import { RefreshSession } from '../models/refreshSession.model';
import { asyncHandler } from './asyncHandler';

export const globalLogout = asyncHandler(async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res
        .status(400)
        .json(new ApiResponse(400, 'Refresh token not found'));
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.clearCookie('refreshToken', cookieOptions);
      return res
        .status(200)
        .json(new ApiResponse(200, 'Logged out successfully'));
    }

    const { _id: principalId, principalType } = decoded;

    // ✅ Revoke ALL sessions for that user’s principal type
    const result = await RefreshSession.updateMany(
      { principalId, revoked: false, principalType },
      { revoked: true }
    );

    res.clearCookie('refreshToken', cookieOptions);
    return res
      .status(200)
      .json(new ApiResponse(200, `${principalType} logged out globally`, {revokedCount: result.modifiedCount}));
  } catch (error) {
    return next(error);
  }
});
