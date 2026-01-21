import { Router } from 'express';
import { jwtVerify } from '../middlewares/jwtMiddleware.js';
import { requireActiveUser } from '../middlewares/authMiddleware.js';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  postUpdate,
  statusUpdate,
} from '../singleImport.js';
import { upload } from '../middlewares/multerMiddleware.js';

const router = Router();

// protected routes
router.post(
  '/create',
  jwtVerify,
  requireActiveUser,
  upload.array('images', 5),
  createPost
);
router.patch('/:jobId/status', jwtVerify, requireActiveUser, statusUpdate);
router.get('/:jobId', jwtVerify, requireActiveUser, getPost);
router.get('/total', jwtVerify, requireActiveUser, getAllPosts);
router.patch('/:jobId', jwtVerify, requireActiveUser, postUpdate);
router.delete('/:jobId', jwtVerify, requireActiveUser, deletePost);

export default router;
