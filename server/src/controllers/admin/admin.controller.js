import { rateLimiter } from '../../config';
import { Admin } from '../../models/admin.model';
import { ApiError } from '../../utils/apiError';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { cookieOptions } from '../../utils/cookieOptions';
import { generateAccessToken } from '../../utils/jwt';

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
  const refreshToken = generateRefreshToken(adminObj._id);

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(200).json(
    new ApiResponse(200, 'Login successful', {
      admin: adminObj,
      accessToken: accessToken,
    })
  );
});
