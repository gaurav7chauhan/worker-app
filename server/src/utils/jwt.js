import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RefreshSession } from '../models/refreshSession.model.js';
import ms from 'ms';

export const generateAccessToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_ACCESS_SECRET, {
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

export const generateRefreshToken = async (userId, type) => {
  const jti = uuidv4();

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

  const expiresAt = new Date(Date.now() + ms(expiresIn));

  const refreshToken = jwt.sign(
    { _id: userId, jti, principalType: type },
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
  });

  return refreshToken;
};

export const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (!decoded.jti) {
      return null;
    }

    const session = await RefreshSession.findOne({
      jti: decoded.jti,
      revoked: false,
    });

    if (!session) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};
