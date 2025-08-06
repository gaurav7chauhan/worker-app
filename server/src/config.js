import Redis from 'ioredis';
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

import { RateLimiterRedis } from 'rate-limiter-flexible';
const maxWrongAttemptsByIPperHour = 5;

export const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'adminlogin_fail_ip',
  points: maxWrongAttemptsByIPperHour, // 5 points
  duration: 60 * 15, // Per 15 minutes
  blockDuration: 60 * 15, // Block for 15 minutes if exceeded
});
