import { Router } from 'express';
import { jwtVerify } from '../middlewares/jwtMiddleware.js';
import { requireActiveUser } from '../middlewares/authMiddleware.js';
import {
  createPost,
  deleteAllPosts,
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
router.patch('/:jobId', jwtVerify, requireActiveUser, postUpdate);

router.get('/', jwtVerify, requireActiveUser, getAllPosts);
router.get('/:jobId', jwtVerify, requireActiveUser, getPost);


router.delete('/bulk/purge', jwtVerify, requireActiveUser, deleteAllPosts);
router.delete('/:jobId', jwtVerify, requireActiveUser, deletePost);

export default router;
