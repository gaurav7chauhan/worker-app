import { Router } from 'express';
import { requestRegisterOtp } from '../controllers/otp/requestOTP.js';
import { verifyOtp } from '../controllers/otp/otpVerification.js';

const router = Router();

// routes/authOtp.routes.js
router.post('/request-otp', requestRegisterOtp);
router.post('/verify-otp', verifyOtp);

export default router;
