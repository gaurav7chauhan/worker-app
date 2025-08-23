import { User } from '../models/user.model';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { cookieOptions } from '../utils/cookieOptions';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';

export const refreshAccessTokens = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded._id);

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = await generateRefreshToken(user._id);

    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    res.status(200).json(
      new ApiResponse(200, 'Tokens refreshed successfully', {
        accessToken: newAccessToken,
      })
    );
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
    return;
  }
});
