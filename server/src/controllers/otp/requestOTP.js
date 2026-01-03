import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { AuthUser } from '../../models/authModel.js';
import { requestOtpService } from '../../services/otpAuthService.js';
import { AppError } from '../../utils/apiError.js';

export const requestRegisterOtp = asyncHandler(async (req, res) => {
  const { userId, email, purpose } = req.body;

  // basic guard

  if (!purpose) {
    throw new AppError('OTP purpose is required', { status: 400 });
  }

  const user = await AuthUser.findById(userId).select('emailVerified');
  if (!user) throw new AppError('User not found', { status: 404 });

  // 🚨 Only block for REGISTER purpose
  if (purpose === 'register' && user.emailVerified) {
    throw new AppError('Email already verified', { status: 400 });
  }

  const response = await requestOtpService(userId, email, purpose);

  return res.json({
    message: response.resent
      ? 'OTP already sent. Please wait.'
      : 'OTP sent successfully',
  });
});
