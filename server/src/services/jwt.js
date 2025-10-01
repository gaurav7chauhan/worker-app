import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import ms from 'ms';
import { RefreshSession } from '../models/tokenModel.js';

export const generateAccessToken = (userId) => {
  const jti = uuidv4();
  return jwt.sign({ _id: userId, jti }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateRefreshToken = async (userId, type, ip, userAgent) => {
  try {
    const jti = uuidv4();

    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

    const expiresAt = new Date(Date.now() + ms(expiresIn));

    const refreshToken = jwt.sign(
      { _id: userId.toString(), jti, principalType: type },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn,
      }
    );

    await RefreshSession.create({
      principalType: type,
      principalId: userId,
      jti,
      expiresAt,
      revoked: false,
      ip,
      userAgent,
    });

    return refreshToken;
  } catch (error) {
    console.log('refresh token error:', error);
    throw new Error('Failed to generate refresh token');
  }
};

export const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (!decoded?.jti || !decoded?._id) return null;

    const session = await RefreshSession.findOne({
      jti: decoded.jti,
      principalId: decoded._id,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });
    if (!session) return null;

    return { decoded, session };
  } catch (error) {
    return null;
  }
};


