import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../../config/rateLimiterConfig';

const rlResend = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:resend',
  points: 1, // 1 request
  duration: 30, // per 30s
  blockDuration: 60, // block for 60s on exceed
});

const rlVerify = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:verify',
  points: 5, // 5 attempts
  duration: 60, // per 60s
  blockDuration: 300, // block for 5 min
});

// Middlewares

export const limitResend = async (req, res, next) => {
  const who =
    (req.body.userId || req.body.email || 'anon') +
    ':' +
    (req.body.purpose || 'na');
    
  const key = `${req.ip}:${who}`;
  try {
    const resConsume = await rlResend.consume(key);
    res.set('X-RateLimit-Remaining', String(resConsume.remainingPoints));
    return next();
  } catch (e) {
    const seconds = Math.ceil((e?.msBeforeNext || 60000) / 1000);
    res.set('Retry-After', String(seconds));
    return res
      .status(429)
      .json({ error: 'Resend cooldown, try later', retryAfterSec: seconds });
  }
};

export const limitVerify = async (req, res, next) => {
  const who =
    (req.body.userId || req.body.email || 'anon') +
    ':' +
    (req.body.purpose || 'na');
  const key = `${req.ip}:${who}`;
  try {
    const resConsume = await rlVerify.consume(key);
    res.set('X-RateLimit-Remaining', String(resConsume.remainingPoints));
    return next();
  } catch (e) {
    const seconds = Math.ceil((e?.msBeforeNext || 300000) / 1000);
    res.set('Retry-After', String(seconds));
    return res
      .status(429)
      .json({ error: 'Too many attempts', retryAfterSec: seconds });
  }
};
