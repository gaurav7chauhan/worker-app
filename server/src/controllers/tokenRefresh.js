import { RefreshSession } from '../models/tokenModel.js';
import { AppError } from '../utils/apiError.js';
import { cookieOptions } from '../services/cookieOptions.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../services/jwt.js';

export const refreshHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new AppError('Missing refresh token', { status: 401 });
    }

    const verified = await verifyRefreshToken(token);
    if (!verified) {
      throw new AppError('Invalid or expired refresh token', { status: 401 });
    }

    const { decoded, session } = verified;

    await RefreshSession.updateOne(
      { _id: session._id },
      { $set: { revoked: true, revokedAt: new Date(), reason: 'ROTATED' } }
    );

    const accessToken = await generateAccessToken(decoded._id);
    const refreshToken = await generateRefreshToken(
      decoded._id,
      decoded.principalType || 'User'
    );

    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(200).json({ accessToken, message: 'Token refreshed' });
  } catch (error) {
    next(error);
  }
};
