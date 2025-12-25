import { createClient } from 'redis';

export const redis = createClient({
  url: process.env.REDIS_URI,
  socket: {
    connectTimeout: 10000,
    keepAlive: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 500, 5000),
  },
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis Error:', err.message));

export async function ensureRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}
