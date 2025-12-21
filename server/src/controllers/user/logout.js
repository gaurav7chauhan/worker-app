import { RefreshSession } from '../../models/tokenModel.js';
import { cookieOptions } from '../../utils/cookieOptions.js';
import { verifyAccessToken, verifyRefreshToken } from '../../utils/jwt.js';
import { blacklistAccessJti } from '../../services/redisToken.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const logout = asyncHandler(async (req, res) => {
  // 1️⃣ Extract access token
  const authz = req.headers.authorization || '';
  const parts = authz.split(' ');
  const accessToken =
    parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;

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
