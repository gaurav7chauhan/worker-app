import { Router } from 'express';
import { jwtVerify } from '../middlewares/jwtVerify.js';
import { requireActiveUser } from '../middlewares/authMiddleware.js';
import { raiseComplaint } from '../controllers/complaintBox/raiseComplaint.js';

const router = Router();

// protected route
router.post('/', jwtVerify, requireActiveUser, raiseComplaint);

export default router;
