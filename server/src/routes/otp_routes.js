import { Router } from 'express';
import { requestRegisterOtp } from '../controllers/user/requestOTP';
import { verifyOtp } from '../controllers/otp/otpVerification';

const router = Router();

// routes/authOtp.routes.js
router.post('/request-register-otp', requestRegisterOtp);
router.post('/verify-otp', verifyOtp);

export default router;
