import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../../config/rateLimiterConfig';

// rate limiter configs
const rlResend = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:resend',
  points: 1,
  duration: 30,
  blockDuration: 60,
});

const rlVerify = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:verify',
  points: 5,
  duration: 60,
  blockDuration: 300,
});

// resend limiter
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

// verify limiter
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
