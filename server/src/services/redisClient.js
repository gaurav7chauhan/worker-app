import { createClient } from 'redis';

export const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

redis.on('error', (err) => console.log('Redis redis Error', err));

await client.connect();
