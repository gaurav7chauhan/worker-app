import { cookieOptions } from './cookieOptions.js';
import { verifyRefreshToken } from './jwt.js';
import { RefreshSession } from '../models/refreshSession.model.js';

export const globalLogout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token not found' });
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
      .json(
        new ApiResponse(200, `${principalType} logged out globally`, {
          revokedCount: result.modifiedCount,
        })
      );
  } catch (error) {
    return next(error);
  }
};
