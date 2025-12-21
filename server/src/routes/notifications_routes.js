import { Router } from 'express';
import { jwtVerify } from '../middlewares/jwtVerify.js';
import { requireActiveUser } from '../middlewares/authMiddleware.js';
import {
  listJobApplications,
  listWorkerApplication,
  submitApplication,
} from '../singleImport.js';

const router = Router();

// protected routes
router.post('/', jwtVerify, requireActiveUser, submitApplication);
router.get('/employer', jwtVerify, requireActiveUser, listJobApplications);
router.get('/worker', jwtVerify, requireActiveUser, listWorkerApplication);

export default router;
