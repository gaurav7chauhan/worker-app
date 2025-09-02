// npm i rate-limiter-flexible
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from './redisClient.js';

// Resend limiter
const rlResend = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:resend',
  points: 1, // 1 request
  duration: 30, // per 30s
  blockDuration: 60, // block for 60s on exceed
});
// Middlewares
export const limitResend = async (req, res, next) => {
  try {
    const who = req.body.userId || req.body.email || 'anon';
    const key = `${req.ip}:${who}`;
    await rlResend.consume(key);
    return next();
  } catch {
    res.set('Retry-After', '60');
    return res.status(429).json({ error: 'Resend cooldown, try later' });
  }
};

//----------------------------------------------------------------------------
// Verify limiter
const rlVerify = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:verify',
  points: 5, // 5 attempts
  duration: 60, // per 60s
  blockDuration: 300, // block for 5 min
});
export const limitVerify = async (req, res, next) => {
  try {
    const who = req.body.userId || req.body.email || 'anon';
    const key = `${req.ip}:${who}`;
    await rlVerify.consume(key);
    return next();
  } catch {
    res.set('Retry-After', '300');
    return res.status(429).json({ error: 'Too many attempts' });
  }
};

// Apply to routes
app.post('/otp/request', limitResend, requestOtp);
app.post('/otp/verify', limitVerify, verifyOtp);
