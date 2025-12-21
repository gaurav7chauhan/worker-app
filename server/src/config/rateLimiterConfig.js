import { createClient } from 'redis';

export const redis = createClient({
  url: process.env.REDIS_URI,
  socket: {
    connectTimeout: 10000, // 10 sec
    keepAlive: 5000,
    reconnectStrategy: (r) => Math.min(1000 * 2 ** r, 30000),
    // no TLS here for plain endpoint
  },
});

redis.on('error', (err) => console.log('Redis Error', err));

export async function ensureRedis() {
  if (!redis.isOpen) await redis.connect();
  return redis;
}
// Call ensureRedis() during server startup to connect early
