import { Router } from 'express';
import { forgotPasswordEmail } from '../controllers/password/forgotPasswordEmail.js';
import { resetPassword } from '../controllers/password/resetPassword.js';

const router = Router();

router.post('/forgot-email', forgotPasswordEmail);
router.post('/reset', resetPassword);

export default router;
