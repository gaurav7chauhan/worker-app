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
import { workerApply } from './controllers/user/application.js';

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
app.patch('/user/profile', jwtVerify, upload.single('avatar'), updateUserProfile);
app.post('/user/role/switch/:role', jwtVerify, switchRole);

// Job Posts
app.post('/jobs/create', jwtVerify, post);
app.post('/jobs/apply', jwtVerify, workerApply);

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
