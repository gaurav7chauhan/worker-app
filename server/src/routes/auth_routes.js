import { Router } from 'express';
import { jwtVerify } from '../middlewares/jwtMiddleware.js';
import { requireActiveUser } from '../middlewares/authMiddleware.js';
import {
  getProfile,
  login,
  logout,
  registerEmployer,
  registerWorker,
} from '../singleImport.js';

const router = Router();

// public routes
router.post('/register/employer', registerEmployer);
router.post('/register/worker', registerWorker);
router.post('/login', login);

// protected routes
router.post('/logout', jwtVerify, requireActiveUser, logout);
router.get('/', jwtVerify, requireActiveUser, getProfile);

export default router;
