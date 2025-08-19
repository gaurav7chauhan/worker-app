import { createClient } from 'redis';

export const client = createClient({
  username: 'default',
  password: '7VFSq9URwMGTxxfS5wheGlpRItWrh821',
  socket: {
    host: 'redis-10971.c1.ap-southeast-1-1.ec2.redns.redis-cloud.com',
    port: 10971,
  },
});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();
