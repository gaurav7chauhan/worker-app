import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';

import {
  registerEmployer,
  registerWorker,
} from './controllers/user/register.js';
import { loginUser } from './controllers/user/login.js';
import { updateUserProfile } from './controllers/user/updateProfile.js';
import { jwtVerify } from './middlewares/jwtAuth.js';
import { switchRole } from './controllers/user/toggleRole.js';
import { upload } from './middlewares/multer.js';
import { post } from './controllers/user/post.js';

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

app.post('/user/registerEmployer', registerEmployer);
app.post('/user/registerWorker', registerWorker);
app.post('/user/login', loginUser);
app.patch('/user/profile/update', jwtVerify, upload.single('avatar'), updateUserProfile);
app.post('/user/account/switch/:role', jwtVerify, switchRole);
app.post('/user/post/create', jwtVerify, post)
// app.get('/user/logout', logoutUser);
// app.delete('/user/delete', authToken, deleteUserAccount);
// app.put('/user/email/update', authToken, updateUserEmail);
// app.put('/user/bio/update', authToken, updateUserBio);
// app.get('/user/profile', authToken, getUserProfile);
// app.put('/user/password/forgot', forgotPassword);
// app.put('/user/password/reset', authToken, resetPassword);
// // New brace-style optionals (supported)
// app.get('/user/rating{/:userId}', authToken, getUserRating);
// app.post('/user/set-ratings/:targetUserId/:jobId', authToken, setUserRating);
// app.get('/user/ratings/given{/:page}', authToken, getMyGivenRatings);

// app.post('/job/post/create', authToken, createJobPost);
// app.get('/job/user/posts{/:page}{/:limit}', authToken, getAllUserJobPosts);
// app.get('/job/user/post/:jobId', authToken, getUserJobPostById);

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
