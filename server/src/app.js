import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ZodError } from 'zod';
import { adminLogin } from './controllers/admin/admin.js';
import { registerUser } from './controllers/user/user.js';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.post('/admin/login', adminLogin);
app.post('/user/register', registerUser);
// for global error handling

app.use((err, req, res, next) => {
  console.error('Error:', err); 

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.errors[0].message, // you can show full array too
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
