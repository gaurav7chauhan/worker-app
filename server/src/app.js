import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import { adminLogin } from './controllers/admin/admin.js';
import {
  loginUser,
  logoutUser,
  registerUser,
} from './controllers/user/user.js';
import { deleteUserAccount } from './controllers/user/removeUser.js';
import { authToken } from './middleware/authMiddleware.js';
import { updateUserEmail } from './controllers/user/updateUser.js';
import { updateUserBio } from './controllers/user/userBio.js';
import { getUserProfile } from './controllers/user/getUser.js';
import { forgotPassword, resetPassword } from './controllers/user/password.js';
import {
  getMyGivenRatings,
  getUserRating,
  setUserRating,
} from './controllers/user/rating.js';
import {
  createJobPost,
  getAllUserJobPosts,
  getUserJobPostById,
} from './controllers/user/jobPost.js';

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
app.post('/user/login', loginUser);
app.get('/user/logout', logoutUser);
app.delete('/user/delete', authToken, deleteUserAccount);
app.put('/user/email/update', authToken, updateUserEmail);
app.put('/user/bio/update', authToken, updateUserBio);
app.get('/user/profile', authToken, getUserProfile);
app.put('/user/password/forgot', forgotPassword);
app.put('/user/password/reset', authToken, resetPassword);
// New brace-style optionals (supported)
app.get('/user/rating{/:userId}', authToken, getUserRating);
app.post('/user/set-ratings/:targetUserId/:jobId', authToken, setUserRating);
app.get('/user/ratings/given{/:page}', authToken, getMyGivenRatings);

app.post('/job/post/create', authToken, createJobPost);
app.get('/job/user/posts{/:page}{/:limit}', authToken, getAllUserJobPosts);
app.get('/job/user/post/:jobId', authToken, getUserJobPostById);

// error handler
app.use((err, req, res) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL';
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();

  // Server logs: include stack for exact file/line
  console.error({
    requestId,
    status,
    code,
    message: err.message,
    meta: err.meta,
    stack: err.stack, // shows file:line for quick debugging
  });

  // Client JSON: clean message
  res.status(status).json({
    error: {
      code,
      message: status >= 500 ? 'Internal server error' : err.message,
    },
    requestId,
  });
});

export default app;
