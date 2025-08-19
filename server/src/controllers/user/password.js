import { User } from '../../models/user.model.js';
import { verifyOtp } from '../../services/otp.service.js';
import {
  userForgotPasswordSchema,
  userPasswordUpdateSchema,
} from '../../validators/user.validator.js';

export const forgotPassword = async (req, res) => {
  try {
    const result = userForgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }

    const { email, newPassword, otp, type } = result.data;

    if (otp && type) {
      await verifyOtp(email, otp, type);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found with this email' });
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message || 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = userPasswordUpdateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }

    const { currentPassword, newPassword, confirmPassword } = result.data;

    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(await user.isPasswordMatch(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message || 'Internal server error' });
  }
};
