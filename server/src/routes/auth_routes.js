import { Router } from 'express';
import { login, registerEmployer, registerWorker } from '../singleImport.js';

const router = Router();

router.post('/employer', registerEmployer);
router.post('/worker', registerWorker);
router.post('/login', login);

export default router;
