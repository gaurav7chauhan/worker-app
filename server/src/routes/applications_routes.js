import { Router } from 'express';
import {
  listJobApplications,
  listWorkerApplication,
  submitApplication,
} from '../singleImport.js';

const router = Router();

router.post('/', submitApplication);
router.get('/employer', listJobApplications);
router.get('/worker', listWorkerApplication);

export default router;
