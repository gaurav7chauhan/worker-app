import { User } from '../../models/user.model';
import { verifyOtp } from '../../services/otp.service';
import { ApiError } from '../../utils/apiError';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { uploadOnCloudinary } from '../../utils/cloudinaryConfig';
import { cookieOptions } from '../../utils/cookieOptions';
import { globalLogout } from '../../utils/globalLogout ';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import {
  userForgotPasswordSchema,
  userLoginSchema,
  userPasswordUpdateSchema,
  userRegistrationSchema,
  userEmailUpdateSchema,
} from '../../validators/user.validator';

// user registration
export const registerUser = asyncHandler(async (req, res) => {
  const result = userRegistrationSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message });
  }

  const { fullName, email, password, userType, agreeTerms, location, otp } =
    result.data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: 'User already exists with this email' });
  }

  // Validate profile image
  if (!req.file && !req.file.path) {
    return res.status(400).json({ message: 'Profile image is required' });
  }

  const uploadImage = await uploadOnCloudinary(req.file.path);
  if (!uploadImage) {
    return res.status(500).json({ message: 'Image upload failed' });
  }

  // we remove this "if method" when used in production
  if (otp) {
    await verifyOtp(email, otp, 'register');
  }
  // instead we do this and deleted upper code
  // if (!otp || !type) {
  //   throw new ApiError(400, 'OTP and type are required');
  // }
  // await verifyOtp(email, otp, type);

  const newUser = await User.create({
    fullName,
    email,
    password,
    userType,
    location,
    agreeTerms,
    profileImage: uploadImage.secure_url,
  });

  if (!newUser) {
    throw new ApiError(500, 'User registration failed');
  }

  const userObj = newUser.toObject();
  delete userObj.password; // Remove password from response

  const accessToken = generateAccessToken(newUser._id);
  const refreshToken = generateRefreshToken(newUser._id, 'user');

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(201).json(
    new ApiResponse(201, 'User registered successfully', {
      user: userObj,
      accessToken: accessToken,
    })
  );
});

// login user
export const loginUser = asyncHandler(async (req, res) => {
  const result = userLoginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message });
  }

  const { email, password, otp, type } = result.data;

  const existingUser = await User.findOne({ email });

  if (existingUser?.isBlocked) {
    throw new ApiError(403, 'Your account has been blocked by admin');
  }

  if (!existingUser) {
    throw new ApiError(404, 'User not found with this email');
  }

  if (!(await existingUser.isPasswordMatch(password))) {
    throw new ApiError(401, 'Incorrect password');
  }

  if (otp) {
    await verifyOtp(email, otp, 'login');
  }

  // instead we do this and deleted upper code
  // if (!otp || !type) {
  //   throw new ApiError(400, 'OTP and type are required');
  // }
  // await verifyOtp(email, otp, type);

  const userObj = existingUser.toObject();
  delete userObj.password;

  const accessToken = generateAccessToken(existingUser._id);
  const refreshToken = generateRefreshToken(existingUser._id, 'user');

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(200).json(
    new ApiResponse(200, 'User logged in successfully', {
      user: userObj,
      accessToken: accessToken,
    })
  );
});

// logout user
export const logoutUser = globalLogout;

// get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const getUser = req.user;

  const userObj = getUser.toObject();
  delete userObj.password;

  res.status(200).json(
    new ApiResponse(200, 'User profile fetched successfully', {
      user: userObj,
    })
  );
});

// update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const result = userEmailUpdateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message });
  }

  const { otp, email, password } = result.data;
  const userId = req.user._id;

  // 1. Check if the new email is already in use
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new ApiError(400, 'Email already exists');
  }

  // 2. Get current user
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new ApiError(404, 'User not found');
  }

  // 3. Check current password
  const isPasswordValid = await existingUser.isPasswordMatch(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Password is incorrect'); // 401 for auth failure
  }

  if (otp) {
    await verifyOtp(email, otp, 'update');
    // instead we do this and deleted upper code
    // if (!otp || !type) {
    //   throw new ApiError(400, 'OTP and type are required');
    // }
    // await verifyOtp(email, otp, 'update');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { email },
    { new: true } // set `true` if you want only updated fields validated
  ).select('-password');

  res.status(200).json(
    new ApiResponse(200, 'Email updated successfully', {
      user: updatedUser,
    })
  );
});

// delete user account
export const deleteUserAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const deleteUser = await User.findByIdAndDelete(userId);

  if (!deleteUser) {
    throw new ApiError(404, 'User not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, 'User account deleted successfully'));
});

// forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const result = userForgotPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message });
  }

  const { email, newPassword, otp, type } = result.data;

  if (otp && type) {
    await verifyOTP(email, otp, type);
  }

  const user = await User.findOne({ email });

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  if (!user) {
    throw new ApiError(404, 'User not found with this email');
  }

  res.status(200).json(new ApiResponse(200, 'Password updated successfully'));
});

// reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const result = userPasswordUpdateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message });
  }

  const { currentPassword, newPassword, confirmPassword } = result.data;

  if (!(await user.isPasswordMatch(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, 'Password updated successfully'));
});

export const userBio = asyncHandler(async (req, res) => {});
