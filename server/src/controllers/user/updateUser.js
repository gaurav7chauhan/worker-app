import { User } from '../../models/userModel.js';
import { verifyOtp } from '../../services/otp.js';
import { userEmailUpdateSchema } from '../../validators/userValidate.js';

export const updateUserEmail = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = userEmailUpdateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }

    const { otp, email, password } = result.data;
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await existingUser.isPasswordMatch(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    if (otp) {
      await verifyOtp(email, otp, 'update');
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email },
      { new: true }
    ).select('-password -isBlocked -averageRating -ratings');

    return res.status(200).json({
      message: 'Email updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message || 'Internal server error' });
  }
};
