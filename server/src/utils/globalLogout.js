import { cookieOptions } from './cookieOptions.js';
import { verifyRefreshToken } from './jwt.js';
import { RefreshSession } from '../models/refreshSessionModel.js';

export const globalLogout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: 'token not found' });
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(200).json({ message: 'Logged out successfully' });
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
      .json({ message: `${principalType} logged out globally` });
  } catch (error) {
    return next(error);
  }
};
