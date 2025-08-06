import { connectDB } from './database/dbConnection.js';
import app from './app.js';
import dotenv from 'dotenv';
console.log("running")

dotenv.config({ path: './.env' });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
    app.on('error', (err) => {
      console.log('ERROR:', err);
      throw err;
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
  });
