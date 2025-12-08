import { AuthUser } from '../../models/authModel.js';
import { RefreshSession } from '../../models/tokenModel.js';
import { cookieOptions } from '../../services/cookieOptions.js';
import { verifyAccessToken, verifyRefreshToken } from '../../services/jwt.js';
import { blacklistAccessJti } from '../../services/redisToken.js';
import { AppError } from '../../utils/apiError.js';

export const logout = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }
    const user = await AuthUser.findById(req.auth._id).select('role');
    if (!user) {
      throw new AppError(`${user.role} not found`, { status: 404 });
    }

    // 1) Parse access token safely
    const authz = req.headers.authorization || '';
    const parts = authz.split(' ');
    const accToken =
      parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;

    // 2) Revoke refresh token for this session
    const refToken = req.cookies?.refreshToken;
    if (refToken) {
      const result = await verifyRefreshToken(refToken);
      if (result) {
        const { decoded, session } = result;
        await RefreshSession.updateOne(
          { _id: session._id, revoked: false },
          { $set: { revoked: true, revokedAt: new Date(), reason: 'logout' } }
        );
      }
      res.clearCookie('refreshToken', cookieOptions);
    }

    if (accToken) {
      const decoded = verifyAccessToken(accToken);
      if (decoded && decoded.jti) {
        await blacklistAccessJti(decoded.jti, decoded.exp);
      }
    }

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};
