import { User } from '../../models/user.model.js';
import { UserBio } from '../../models/userBio.model.js';
import { verifyOtp } from '../../services/otp.service.js';
import {
  userEmailUpdateSchema,
  userBioSchema,
} from '../../validators/user.validator.js';

export const updateUserEmail = async (req, res) => {
  try {
    const result = userEmailUpdateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }

    const { otp, email, password } = result.data;
    const userId = req.user._id;

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
    ).select('-password');

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

export const updateUserProfile = async (req, res) => {
  try {
    const result = userBioSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.errors[0].message });
    }

    const userId = req.user._id;

    const updatedFields = Object.fromEntries(
      Object.entries(result.data).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ''
      )
    );

    let userData = await UserBio.findOneAndUpdate(
      { owner: userId },
      { $set: updatedFields },
      { new: true }
    );

    if (!userData) {
      const createUserBio = await UserBio.create({
        owner: userId,
        ...updatedFields,
      });

      return res.status(201).json({
        message: 'User Bio created successfully',
        data: createUserBio,
      });
    }

    return res.status(200).json({
      message: 'User Bio updated successfully',
      data: userData,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message || 'Internal server error' });
  }
};
