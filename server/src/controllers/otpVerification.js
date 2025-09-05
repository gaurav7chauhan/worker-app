import { verifyOtpService } from '../utils/otp';

export const verifyOtp = async (req, res, next) => {
  try {
    const { userId, email, purpose, code } = req.body;

    const out = await verifyOtpService(String(userId), email, purpose, code);

    if (!out.ok) {
      if (out.reason === 'too_many_attempts') {
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
