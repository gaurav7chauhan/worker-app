import { Router } from 'express';
import {
  getEmployer,
  getJob,
  getWorker,
  listEmployers,
  listJobs,
  listWorkers,
} from '../singleImport.js';

const router = Router();

// public routes
router.get('/employers', listEmployers);
router.get('/jobs', listJobs);
router.get('/workers', listWorkers);

router.get('/employers/:employerId', getEmployer);
router.get('/jobs/:jobId', getJob);
router.get('/workers/:workerId', getWorker);

export default router;
