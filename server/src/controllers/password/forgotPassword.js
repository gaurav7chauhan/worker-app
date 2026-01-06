import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { AuthUser } from '../../models/authModel.js';
import { requestOtpService } from '../../services/otpAuthService.js';
import { AppError } from '../../utils/apiError.js';
import { forgotPasswordSchema } from '../../validator/password_valid.js';

export const forgotPassword = asyncHandler(async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new AppError(err?.message, { status: 422 });
  }

  const { email } = parsed.data;

  const authUser = await AuthUser.findOne({ email }).select('_id email');
  if (!authUser) {
    throw new AppError('User not found', { status: 404 });
  }

  await requestOtpService(authUser._id, authUser.email, 'password_reset');

  return res.status(200).json({ message: 'OTP sent successfully' });
});
