import { cookieOptions } from '../../config/cookieOptions.js';
import { generateAccessToken, generateRefreshToken } from '../../services/tokenService.js';
import { loginSchema } from '../../validator/login_valid.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { AuthUser } from '../../models/authModel.js';

export const login = asyncHandler(async (req, res) => {
  // Validate request body
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'fail',
      message: result.error.issues[0].message,
    });
  }

  const { email, password } = result.data;

  // Find user
  const foundUser = await AuthUser.findOne({ email });
  if (!foundUser) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password',
    });
  }

  // Verify password
  const isMatch = await foundUser.isPasswordMatch(password);
  if (!isMatch) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password',
    });
  }

  // Blocked user check
  if (foundUser.isBlocked) {
    return res.status(409).json({
      status: 'fail',
      message: 'You are blocked by admin',
    });
  }

  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

  if (!foundUser.emailVerified) {
    return res.status(403).json({
      status: 'fail',
      message: 'Email not verified. Please verify first.',
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(foundUser._id);
  const refreshToken = await generateRefreshToken(
    foundUser._id,
    'User',
    ip,
    userAgent
  );

  res.cookie('refreshToken', refreshToken, cookieOptions);

  return res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token: accessToken,
    userId: foundUser._id,
  });
});
