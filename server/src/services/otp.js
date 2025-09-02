import bcrypt from 'bcrypt';
import { OtpToken } from '../models/otpTokens.js';
import { sendOtp } from './mail/mailer.js';
import { redis } from './redisClient.js';

export const requestOtp = async (req, res, next, email) => {
  try {
    const { userId, purpose, channel } = req.body;

    const key = `otp:${userId}:${purpose}:${channel}`;
    const ttlSec = 5 * 60;

    const existing = await redis.get(key);
    if (existing) {
      await sendOtp(email, existing);
      return res.status(200).json({ message: 'OTP resent' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6 digit
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await OtpToken.findOneAndUpdate(
      { userId, purpose, channel, consumed: false },
      {
        $set: { codeHash, expiresAt, attempts: 0 },
        $setOnInsert: { userId, purpose, channel },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await redis.set(key, otp, { EX: ttlSec });
    await sendOtp(email, otp);
    return res.status(200).json({ message: 'OTP sent' });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { userId, code, channel, purpose } = req.body;
    
    const otp = await OtpToken.findOne({
      userId,
      channel,
      purpose,
      consumed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) return res.status(400).json({ error: 'Invalid or expired OTP' });

    if (otp.attempts >= 5) {
      await OtpToken.deleteOne({ _id: otp._id });
      return res.status(429).json({ error: 'Too many attempts' });
    }

    const ok = await bcrypt.compare(String(code), otp.codeHash);
    
    if (!ok) {
      await OtpToken.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await OtpToken.updateOne({ _id: otp._id }, { $set: { consumed: true } });

    return res.status(200).json({ message: 'OTP verify successfully' });
  } catch (error) {
    next(error);
  }
};
