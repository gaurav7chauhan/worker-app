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
import { post } from './controllers/posts/createPost.js';
import { logoutUser } from './controllers/logout/logout.js';
import { submitApplication } from './controllers/userApplication/createApp.js';
import { listMyApplications } from './controllers/userApplication/workerApp.js';
import { listJobApplications } from './controllers/userApplication/jobApp.js';
import { listNotifications } from './controllers/notification/getNotif.js';
import { notifyAll } from './controllers/notification/notif.js';
import { markNotificationRead } from './controllers/notification/readSingleNotif.js';
import { markAllNotificationsRead } from './controllers/notification/readAllNotif.js';
import { createRating } from './controllers/ratings/setRate.js';
import { listUserRatings } from './controllers/ratings/fetchingRate.js';
import { myGivenRatings } from './controllers/ratings/ownRate.js';
import { editPost } from './controllers/posts/editPost.js';
import { statusUpdate } from './controllers/posts/statusUpdatePost.js';
import { deletePost } from './controllers/posts/removePost.js';

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

// Job Posts
app.post('/jobs/create', jwtVerify, post);
app.post('/jobs/edit/:jobId', jwtVerify, editPost);
app.patch('/jobs/status/:jobId', jwtVerify, statusUpdate);
app.delete('/jobs/delete/:jobId', jwtVerify, deletePost);

// User Profile
app.patch(
  '/user/profile',
  jwtVerify,
  upload.single('avatar'),
  updateUserProfile
);
app.post('/user/role/:role', jwtVerify, switchRole);
app.get('/user/logout', jwtVerify, logoutUser);

// Applications
app.post('/applications/submit', jwtVerify, submitApplication);
app.get('/applications/mine', jwtVerify, listMyApplications);
app.get('/jobs/:jobId/applications', jwtVerify, listJobApplications);

// // Notifications
app.get('/notifications', jwtVerify, listNotifications);
app.post('/notifications/send', jwtVerify, notifyAll);
app.patch('/notifications/:id/read', jwtVerify, markNotificationRead);
app.patch('/notifications/read-all', jwtVerify, markAllNotificationsRead);

// Ratings
app.post('/ratings', jwtVerify, createRating);
app.get('/ratings/outgoing', jwtVerify, myGivenRatings);
app.get('/ratings/incoming', jwtVerify, listUserRatings);

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
