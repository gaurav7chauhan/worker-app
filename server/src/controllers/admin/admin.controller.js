import { rateLimiter } from '../../config';
import { Admin } from '../../models/admin.model';
import { RefreshSession } from '../../models/refreshSession.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { cookieOptions } from '../../utils/cookieOptions';
import { generateAccessToken, verifyRefreshToken } from '../../utils/jwt';

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const key = req.ip + email;

  try {
    await rateLimiter.consume(key);
  } catch (error) {
    return res
      .status(429)
      .json(
        new ApiResponse(
          429,
          'Too many login attempts. Please wait before trying again.'
        )
      );
  }

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const existingAdmin = await Admin.findOne({ email });
  if (!existingAdmin) {
    throw new ApiError(404, 'Admin not found');
  }

  if (!(await existingAdmin.isPasswordMatch(password))) {
    throw new ApiError(401, 'Invalid password');
  }

  const adminObj = existingAdmin.toObject();
  delete adminObj.password;

  const accessToken = generateAccessToken(adminObj._id);
  const refreshToken = generateRefreshToken(adminObj._id, 'admin');

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(200).json(
    new ApiResponse(200, 'Login successful', {
      admin: adminObj,
      accessToken: accessToken,
    })
  );
});

export const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isBlocked = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, 'User blocked successfully'));
});

export const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isBlocked = false;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, 'User unblocked successfully'));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'User deleted successfully'));
});

export const getUsers = asyncHandler(async (req, res) => {
  const { userType, isBlocked } = req.query;

  let filter = {};

  if (userType) {
    filter.userType = userType;
  }

  if (typeof isBlocked !== 'undefined') {
    filter.isBlocked = isBlocked === 'true';
  }

  const users = await User.find(filter).select('-password');

  return res.status(200).json(
    new ApiResponse(200, 'Users fetched successfully', {
      users,
    })
  );
});

export const adminLogout = asyncHandler(async (req, res) => {
  try {
    const refreshToken = res.cookies?.refreshToken;
    if (!refreshToken) {
      return res
        .status(400)
        .json(new ApiResponse(400, 'Refresh token not found'));
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.clearCookie('refreshToken', cookieOptions);
      return res
        .status(200)
        .json(new ApiResponse(200, 'Admin logged out successfully'));
    }

    const { jti, _id: principalId, principalType } = decoded;

    await RefreshSession.findOneAndUpdate(
      { jti, principalId, revoked: false, principalType},
      { revoked: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, 'Admin logged out successfully'));
  } catch (error) {
    return next(error);
  }
});
