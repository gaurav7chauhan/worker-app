import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';

import {
  registerEmployer,
  registerWorker,
} from './controllers/user/register.js';
import { loginUser } from './controllers/login/login.js';
import { updateUserProfile } from './controllers/updateUser/updateProfile.js';
import { jwtVerify } from './middlewares/jwtAuth.js';
import { switchRole } from './controllers/toggle/toggleRole.js';
import { upload } from './middlewares/multer.js';
import { post } from './controllers/user/post.js';
import { logoutUser } from './controllers/logout/logout.js';
import { submitApplication } from './controllers/userApplication/createApp.js';
import { listMyApplications } from './controllers/userApplication/workerApp.js';
import { listJobApplications } from './controllers/userApplication/jobApp.js';
import { listNotifications } from './controllers/notification/getNotif.js';
import { notifyAll } from './controllers/notification/notif.js';
import { markNotificationRead } from './controllers/notification/readSingleNotif.js';

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

// app.set('trust proxy', true);

// Authentication & Registration
app.post('/auth/employer/register', registerEmployer);
app.post('/auth/worker/register', registerWorker);
app.post('/auth/login', loginUser);

// User Profile
app.patch(
  '/user/profile',
  jwtVerify,
  upload.single('avatar'),
  updateUserProfile
);
app.post('/user/role/switch/:role', jwtVerify, switchRole);
app.get('/user/logout', jwtVerify, logoutUser);

// Job Posts
app.post('/jobs/create', jwtVerify, post);

// Applications
app.post('/applications/submit', jwtVerify, submitApplication);
app.get('/applications/mine', jwtVerify, listMyApplications);
app.get('/jobs/:jobId/applications', jwtVerify, listJobApplications);

// // Notifications
app.get('/notifications', jwtVerify, listNotifications);
app.post('/notifications/send', jwtVerify, notifyAll);
app.patch('/notifications/:id/read', jwtVerify, markNotificationRead);
// app.patch('/notifications/read-all', jwtVerify, markAllNotificationsRead);

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
