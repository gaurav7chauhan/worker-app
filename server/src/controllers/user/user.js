import { User } from '../../models/userModel.js';
import { verifyOtp } from '../../services/otp.js';
import { uploadOnCloudinary } from '../../utils/cloudinaryConfig.js';
import { cookieOptions } from '../../utils/cookieOptions.js';
import { globalLogout } from '../../utils/globalLogout.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';
import {
  userLoginSchema,
  userRegistrationSchema,
} from '../../validators/userValidate.js';
import mongoose from 'mongoose';

// registration

export const registerUser = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const result = userRegistrationSchema.safeParse(req.body);

    if (!result.success) {
      await session.abortTransaction();

      let errorMessage = 'Invalid input';
      const issues = result.error.issues;

      if (result.error && Array.isArray(issues) && issues.length > 0) {
        if (issues[0].code === 'invalid_type') {
          errorMessage = `${issues[0].path[0]} is required`;
        } else {
          errorMessage = issues[0].message;
        }
      }

      return res.status(400).json({
        message: errorMessage,
      });
    }

    const { fullName, email, password, userType, location, otp } = result.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: 'User already exists with this email' });
    }

    // Validate profile image

    // if (!req.file || !req.file.path) {
    //   await session.abortTransaction();
    //   return res.status(400).json({ message: 'Profile image is required' });
    // }

    // // External services (Cloudinary/OTP) are not part of Mongo transaction,
    // // but we still run DB writes only after they succeed.

    // const uploadImage = await uploadOnCloudinary(req.file.path);
    // if (!uploadImage) {
    //   await session.abortTransaction();
    //   return res.status(500).json({ message: 'Image upload failed' });
    // }

    if (otp) {
      await verifyOtp(email, otp, 'register');
    }

    // Create user within the transaction
    const [newUser] = await User.create(
      [
        {
          fullName,
          email,
          password,
          userType,
          location,
          // profileImage: uploadImage.secure_url,
        },
      ],
      { session }
    );

    if (!newUser) {
      await session.abortTransaction();
      return res.status(500).json({ message: 'User registration failed' });
    }

    // Commit transaction before generating tokens and sending response
    await session.commitTransaction();

    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.ratings;
    delete userObj.averageRating;
    delete userObj.isBlocked;

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = await generateRefreshToken(newUser._id, 'user');

    res.cookie('refreshToken', refreshToken, cookieOptions);
    return res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: userObj,
        accessToken,
        success: true,
      },
    });
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch (_) {}
    return res
      .status(500)
      .json({ message: err?.message || 'Internal server error' });
  } finally {
    session.endSession();
  }
};

// login

export const loginUser = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const result = userLoginSchema.safeParse(req.body);

    if (!result.success) {
      let errorMessage = 'Invalid input';
      const issues = result.error.issues;

      await session.abortTransaction();

      if (result.error && Array.isArray(issues) && issues.length > 0) {
        if (issues[0].code === 'invalid_type') {
          errorMessage = `${issues[0].path[0]} is required`;
        } else {
          errorMessage = issues[0].message;
        }
      }
      return res.status(400).json({ message: errorMessage });
    }

    const { email, password, otp } = result.data;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ message: 'User not found with this email' });
    }

    if (existingUser?.isBlocked) {
      return res
        .status(403)
        .json({ message: 'Your account has been blocked by admin' });
    }

    if (!(await existingUser.isPasswordMatch(password))) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    if (otp) {
      await verifyOtp(email, otp, 'login');
    }

    const userObj = existingUser.toObject();
    delete userObj.password;
    delete userObj.isBlocked;

    const accessToken = generateAccessToken(existingUser._id);
    const refreshToken = await generateRefreshToken(existingUser._id, 'user');
    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(200).json({
      message: 'User logged in successfully',
      data: {
        user: userObj,
        accessToken,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message || 'Internal server error' });
  }
};

// logout

export const logoutUser = globalLogout;
