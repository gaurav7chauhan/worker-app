import bcrypt from 'bcrypt';
import { OtpToken } from '../models/otpTokens.js';
import { sendOtp } from '../services/mail/mailer.js';
import { redis } from '../../config/rateLimiterConfig.js';

const OTP_TTL_SECONDS = 5 * 60; // 5min
const redisKey = (userId, purpose, email) => {
  return `otp:${userId}:${purpose}:${email}`;
};

export const requestOtpService = async (userId, email, purpose) => {
  const key = redisKey(userId, purpose, email);

  // If OTP exists in Redis, resend same code (no DB writes)
  const existing = await redis.get(key);
  if (existing) {
    await sendOtp(email, existing);
    return { resent: true };
  }

  // Generate code and hash
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digit
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000); // 5 min

  await OtpToken.findOneAndUpdate(
    { userId, purpose, email, consumed: false },
    {
      $set: { codeHash, expiresAt, attempts: 0 },
      $setOnInsert: { userId, purpose, email },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await redis.set(key, code, { EX: OTP_TTL_SECONDS });
  await sendOtp(email, code);
  return { resent: false };
};

export const verifyOtpService = async (userId, email, purpose, code) => {
  const token = await OtpToken.findOne({
    userId,
    purpose,
    email,
    consumed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!token) return { ok: false, reason: 'invalid_or_expired' };

  if (token.attempts >= 5) {
    await OtpToken.deleteOne({ _id: token._id });
    return { ok: false, reason: 'too_many_attempts' };
  }

  const ok = await bcrypt.compare(String(code), token.codeHash);

  if (!ok) {
    await OtpToken.updateOne({ _id: token._id }, { $inc: { attempts: 1 } });
    return { ok: false, reason: 'invalid_or_expired' };
  }

  await OtpToken.updateOne({ _id: token._id }, { $set: { consumed: true } });
  await redis.del(redisKey(userId, purpose, email));

  return { ok: true };
};
