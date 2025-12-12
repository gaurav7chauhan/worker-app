import { Router } from 'express';
import {
  createPost,
  deletePost,
  editPost,
  statusUpdate,
} from '../singleImport.js';

const router = Router();

router.post('/', createPost);
router.patch('/:jobId', editPost);
router.patch('/:jobId/status', statusUpdate);
router.delete('/:jobId', deletePost);

export default router;
