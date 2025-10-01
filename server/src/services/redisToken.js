import { redis } from "../../config/rateLimiterConfig.js";

// blacklist.ts
export const blacklistAccessJti = async (jti, exp) => {
  const ttlMs = Math.max(exp * 1000 - Date.now(), 0);
  if (ttlMs > 0) {
    await redis.set(`bl:${jti}`, '1', 'PX', ttlMs);
  }
};

export const isAccessJtiBlacklisted = async (jti) => {
  return (await redis.get(`bl:${jti}`)) === '1';
};