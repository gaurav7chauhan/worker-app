import { Router } from 'express';
import { getProfile, login, logout, registerEmployer, registerWorker } from '../singleImport';

const router = Router();

router.post('/register/employer', registerEmployer);
router.post('/register/worker', registerWorker)
router.post('/login', login);
router.post('/logout', logout);
router.get('/', getProfile);

export default router;
