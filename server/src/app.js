import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import { upload } from './middlewares/multer.js';
import { jwtVerify } from './singleImport.js';
import authRoutes from './routes/auth_routes.js';
import applicationRoutes from './routes/applications_routes.js';
import fetchRoutes from './routes/fetch_routes.js';
import postRoutes from './routes/post_routes.js';
import notificationRoutes from './routes/notifications_routes.js';
import ratingRoutes from './routes/notifications_routes.js';
import authRoutes from './routes/users_routes.js';

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

// mounting api's
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/application', applicationRoutes);
app.use('/api/v1', fetchRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/auth', authRoutes);

// OTP
// app.post('/otp/request', limitResend, requestOtp);
// app.post('/otp/verify', limitVerify, verifyOtp);

// error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();

  // Server logs: include stack for exact file/line
  console.error({
    requestId,
    status,
    message: err.message,
    stack: err.stack,
  });

  // Client JSON: clean message
  res.status(status).json({
    error: {
      message: status >= 500 ? 'Internal server error' : err.message,
    },
    requestId,
  });
});

export default app;
