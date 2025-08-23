import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
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

export default app;
