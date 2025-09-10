import { verifyOtpService } from '../utils/otp.js';

export const verifyOtp = async (req, res, next) => {
  try {
    const { userId, email, purpose, code } = req.body;

    const output = await verifyOtpService(String(userId), email, purpose, code);

    if (!output.ok) {
      if (output.reason === 'too_many_attempts') {
        return res.status(429).json({ error: 'Too many attempts' });
      }
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    return res.status(200).json({ message: 'Email verified' });
  } catch (error) {
    return next(error);
  }
};

router.post('/otp/verify', limitVerify, verifyOtp);
