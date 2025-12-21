import { Router } from 'express';
import { jwtVerify } from '../middlewares/jwtVerify.js';
import { requireActiveUser } from '../middlewares/authMiddleware.js';
import { switchRole } from '../singleImport.js';

const router = Router();

// protected route
router.patch('/:role', jwtVerify, requireActiveUser, switchRole);

export default router;
