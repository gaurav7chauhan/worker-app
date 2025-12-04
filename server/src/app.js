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

// app.set('trust proxy', true);

// Authentication & Registration
app.post('/auth/employer', registerEmployer);
app.post('/auth/worker', registerWorker);
app.post('/auth/login', loginUser);

// Job Posts
app.post('/jobs/create', jwtVerify, post);
app.post('/jobs/edit/:jobId', jwtVerify, editPost);
app.patch('/jobs/status/:jobId', jwtVerify, statusUpdate);
app.delete('/jobs/delete/:jobId', jwtVerify, deletePost);

// User Profile
app.get('/users/me', getUserProfile);
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
app.delete('/ratings/:ratingId', jwtVerify, deleteRating);

// fetch
app.get('/jobs', jwtVerify, requireActiveUser, listJobs);
app.get('/jobs/:jobId', jwtVerify, requireActiveUser, getJob);

app.get('/workers', jwtVerify, requireActiveUser, listWorkers);
app.get('/workers/:workerId', jwtVerify, requireActiveUser, getWorker);

app.get('/employers', jwtVerify, requireActiveUser, listEmployers);
app.get('/employers/:employerId', jwtVerify, requireActiveUser, getEmployer);

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
