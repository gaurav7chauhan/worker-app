import { RefreshSession } from '../../models/tokenModel.js';
import { cookieOptions } from '../../config/cookieOptions.js';
import {
  verifyAccessToken,
  verifyRefreshToken,
} from '../../services/tokenService.js';
import { blacklistAccessJti } from '../../services/JtiService.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const logout = asyncHandler(async (req, res) => {
  // 1️⃣ Extract access token
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return next(new AppError('Missing access token', { status: 401 }));
  }
  const accessToken = auth.split(' ')[1];

  // 2️⃣ Revoke refresh token session
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    const result = await verifyRefreshToken(refreshToken);
    if (result) {
      const { session } = result;

      await RefreshSession.updateOne(
        { _id: session._id, revoked: false },
        {
          $set: {
            revoked: true,
            revokedAt: new Date(),
            reason: 'logout',
          },
        }
      );
    }

    res.clearCookie('refreshToken', cookieOptions);
  }

  // 3️⃣ Blacklist access token
  if (accessToken) {
    const decoded = verifyAccessToken(accessToken);
    if (decoded?.jti) {
      await blacklistAccessJti(decoded.jti, decoded.exp);
    }
  }

  // 4️⃣ Success
  return res.status(204).end();
});
