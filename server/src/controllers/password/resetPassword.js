import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { resetPasswordSchema } from '../../validator/password_valid.js';
import { AppError } from '../../utils/apiError.js';
import { AuthUser } from '../../models/authModel.js';

export const resetPassword = asyncHandler(async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    const err = parsed.error.issues[0];
    throw new AppError(err.message, { status: 422 });
  }

  const { userId, newPassword, confirmPassword } = parsed.data;

  const user = await AuthUser.findById(userId).select('password');
  if (!user) {
    throw new AppError('User not found', { status: 404 });
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    message: 'Password successfully changed',
  });
});
