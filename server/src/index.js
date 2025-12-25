import { connectDB } from './database/dbConnection.js';
import app from './app.js';
import dotenv from 'dotenv';
import { ensureRedis } from './config/rateLimiterConfig.js';

dotenv.config({ path: './.env' });

async function start() {
  try {
    await ensureRedis();
    await connectDB();

    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    server.on('error', (err) => {
      console.log('HTTP Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Startup failure', error);
    process.exit(1);
  }
}

start();
