import { Router } from 'express';
import { refreshHandler } from '../middlewares/tokenMiddleware.js';

const router = Router();

router.post('/refresh', refreshHandler);

export default router;