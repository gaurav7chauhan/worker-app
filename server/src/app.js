import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth_routes.js';
import applicationRoutes from './routes/applications_routes.js';
import fetchRoutes from './routes/fetch_routes.js';
import postRoutes from './routes/post_routes.js';
import notificationRoutes from './routes/notifications_routes.js';
import ratingRoutes from './routes/ratings_routes.js';
import toggleRoutes from './routes/toggle_routes.js';
import authOtpRoutes from './routes/otp_routes.js';
import passwordRoutes from './routes/password_routes.js';
import metaRoutes from './routes/meta_routes.js';
import refreshRoutes from './routes/refresh_routes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(
  cors({
    origin: process.env.VITE_API_URL,
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
app.use('/api/v1/fetch', fetchRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/toggle-role', toggleRoutes);
app.use('/api/v1/auth', authOtpRoutes);
app.use('/api/v1/password', passwordRoutes);
app.use('/api/v1/meta', metaRoutes);
app.use('/api/v1/refresh', refreshRoutes);

// OTP
// app.post('/otp/request', limitResend, requestOtp);
// app.post('/otp/verify', limitVerify, verifyOtp);

// error handler
app.use(errorHandler);

export default app;
