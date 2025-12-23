import bcrypt from 'bcrypt';
import { OtpToken } from '../models/otpModel.js';
import { sendOtp } from './mail/sendOtp.js';
import { redis } from '../config/rateLimiterConfig.js';
import { AuthUser } from '../models/authModel.js';
import { AppError } from '../utils/apiError.js';

const OTP_TTL_SECONDS = 5 * 60; // 5min
const redisKey = (userId, purpose, email) => {
  return `otp:${userId}:${purpose}:${email}`;
};

// request OTP
export const requestOtpService = async (userId, email, purpose) => {
  if (!userId || !email || !purpose) {
    throw new AppError('Missing required params', {
      status: 400,
    });
  }
  const key = redisKey(userId, purpose, email);

  // 🔐 Resend cooldown (30s)
  const resendKey = `otp:resend:${userId}:${purpose}`;
  const canResend = await redis.set(resendKey, '1', {
    NX: true,
    EX: 30,
  });

  // If user clicks resend too fast, silently ignore
  //   canResend === "OK"   // true (truthy) Key did NOT exist
  //   canResend === null   // false (falsy) Key already exists
  if (!canResend) {
    return { resent: true };
  }

  // If OTP exists in Redis, resend same code (no DB writes)
  let existing;
  try {
    existing = await redis.get(key);
  } catch (error) {
    throw new AppError('Redis Unavailable', {
      status: 503,
      meta: { key },
    });
  }

  if (existing) {
    try {
      await sendOtp(email, existing);
    } catch (error) {
      throw new AppError('Failed to send OTP email', {
        status: 500,

        meta: { step: 'resend' },
      });
    }
    return { resent: true };
  }

  // Generate code and hash
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digit
  let codeHash;
  try {
    codeHash = await bcrypt.hash(code, 10);
  } catch (e) {
    throw new AppError('Hashing failed', {
      status: 500,
      code: 'HASH_FAILED',
    });
  }

  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000); // 5 min
  try {
    await OtpToken.findOneAndUpdate(
      { userId, purpose, email, consumed: false },
      {
        $set: { codeHash, expiresAt, attempts: 0 },
        $setOnInsert: { userId, purpose, email },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (e) {
    throw new AppError('OTP DB upsert failed', {
      status: 500,
      code: 'OTP_DB_UPSERT_FAILED',
    });
  }

  try {
    await redis.set(key, code, { EX: OTP_TTL_SECONDS });
  } catch (e) {
    throw new AppError('Redis set failed', {
      status: 503,
      code: 'REDIS_SET_FAILED',
      meta: { key },
    });
  }

  try {
    await sendOtp(email, code);
  } catch (e) {
    throw new AppError('Failed to send OTP email', {
      status: 502,
      code: 'MAIL_SEND_FAILED',
      meta: { step: 'send' },
    });
  }
  return { resent: false };
};

// Verify OTP
export const verifyOtpService = async (userId, email, purpose, code) => {
  if (!userId || !email || !purpose || !code) {
    throw new AppError('Missing required params', { status: 400 });
  }

  // Find valid, unexpired OTP
  let token = await OtpToken.findOne({
    userId,
    purpose,
    email,
    consumed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!token) {
    return { ok: false, reason: 'invalid_or_expired' };
  }

  //  Prevent brute force
  if (token.attempts >= 5) {
    await OtpToken.deleteOne({ _id: token._id });
    return { ok: false, reason: 'too_many_attempts' };
  }

  // Compare hashed OTP
  let match = false;
  match = await bcrypt.compare(String(code), token.codeHash);

  if (!match) {
    await OtpToken.updateOne({ _id: token._id }, { $inc: { attempts: 1 } });
    return { ok: false, reason: 'invalid_or_expired' };
  }

  // Consume OTP first
  await OtpToken.updateOne({ _id: token._id }, { $set: { consumed: true } });

  //  Mark email verified after register/login OTP
  switch (purpose) {
    case 'register':
      await AuthUser.findByIdAndUpdate(userId, {
        $set: { emailVerified: true },
        $unset: { verificationExpires: '' },
      });
      break;
    case 'login':
      await AuthUser.findByIdAndUpdate(userId, {
        $set: { emailVerified: true },
        $unset: { verificationExpires: '' },
      });
      break;
    case 'password_reset':
      break;
    case 'email_change':
      break;
    default:
      throw new AppError('Unknown OTP purpose', { status: 400 });
  }

  await redis.del(redisKey(userId, purpose, email));
  return { ok: true };
};
