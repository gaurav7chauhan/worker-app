import { Router } from 'express';
import { jwtVerify } from '../middlewares/jwtMiddleware.js';
import { requireActiveUser } from '../middlewares/authMiddleware.js';
import {
  createPost,
  deleteAllPosts,
  deletePost,
  employerPosts,
  getPost,
  postUpdate,
  allPosts,
  statusUpdate,
} from '../singleImport.js';
import { upload } from '../middlewares/multerMiddleware.js';

const router = Router();

router.post(
  '/create',
  jwtVerify,
  requireActiveUser,
  upload.array('employerAssets', 5),
  createPost
);

router.get('/', jwtVerify, requireActiveUser, employerPosts);

// specific static paths first
router.delete('/bulk/purge', jwtVerify, requireActiveUser, deleteAllPosts);

// jobId specific
router.get('/:jobId', jwtVerify, requireActiveUser, getPost);
router.patch('/:jobId/status', jwtVerify, requireActiveUser, statusUpdate);
router.patch('/:jobId', jwtVerify, requireActiveUser, postUpdate);
router.delete('/:jobId', jwtVerify, requireActiveUser, deletePost);

// statusType LAST (most generic)
router.get('/status/:statusType', jwtVerify, requireActiveUser, allPosts);

export default router;
