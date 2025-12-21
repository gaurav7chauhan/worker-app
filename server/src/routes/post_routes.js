import { Router } from 'express';
import { jwtVerify } from '../middlewares/jwtVerify.js';
import { requireActiveUser } from '../middlewares/authMiddleware.js';
import {
  createPost,
  deletePost,
  editPost,
  statusUpdate,
} from '../singleImport.js';

const router = Router();

// protected routes
router.post('/', jwtVerify, requireActiveUser, createPost);
router.patch('/:jobId', jwtVerify, requireActiveUser, editPost);
router.patch('/:jobId/status', jwtVerify, requireActiveUser, statusUpdate);
router.delete('/:jobId', jwtVerify, requireActiveUser, deletePost);

export default router;
