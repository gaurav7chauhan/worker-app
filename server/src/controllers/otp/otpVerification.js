import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { verifyOtpService } from '../../utils/otp.js';

export const verifyOtp = asyncHandler(async (req, res) => {
  const { userId, email, purpose, code } = req.body;

  const output = await verifyOtpService(String(userId), email, purpose, code);

  if (!output.ok) {
    if (output.reason === 'too_many_attempts') {
      return res.status(429).json({ error: 'Too many attempts' });
    }
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  return res.status(200).json({ message: 'Email verified' });
});


