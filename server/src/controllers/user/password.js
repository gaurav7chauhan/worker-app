import { object } from 'zod';
import { User } from '../../models/userModel.js';
import { verifyOtp } from '../../services/otp.js';
import {
  userForgotPasswordSchema,
  userPasswordUpdateSchema,
} from '../../validators/userValidate.js';

export const forgotPassword = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Please provide data' });
    }

    const result = userForgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { email, newPassword, otp } = result.data;

    if (otp) {
      await verifyOtp(email, otp, 'user');
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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized User' });
    }
    const userId = req.user._id;

    if (Object.keys(req.body).length < 1) {
      return res.status(400).json({ message: 'Please provide data' });
    }

    const result = userPasswordUpdateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { currentPassword, newPassword } = result.data;

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
