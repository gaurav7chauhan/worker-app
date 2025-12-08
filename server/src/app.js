import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import { upload } from './middlewares/multer.js';
import {
  createRating,
  deletePost,
  deleteRating,
  editPost,
  getEmployer,
  getJob,
  getUserProfile,
  getWorker,
  jwtVerify,
  listEmployers,
  listJobApplications,
  listJobs,
  listMyApplications,
  listNotifications,
  listUserRatings,
  listWorkers,
  loginUser,
  logoutUser,
  markAllNotificationsRead,
  markNotificationRead,
  myGivenRatings,
  notifyAll,
  post,
  registerEmployer,
  registerWorker,
  requireActiveUser,
  statusUpdate,
  submitApplication,
  switchRole,
  updateUserProfile,
} from './singleImport.js';

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
