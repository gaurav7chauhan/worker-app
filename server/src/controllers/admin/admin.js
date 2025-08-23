import { client } from '../../../config/rateLimiterConfig.js';
import { Admin } from '../../models/adminModel.js';
import { cookieOptions } from '../../utils/cookieOptions.js';
import { globalLogout } from '../../utils/globalLogout.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const key = req.ip + email;

    const ratelimit = await client.set(key, `${key}`, 'EX', 3600);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (!existingAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // if (!(await existingAdmin.isPasswordMatch(password))) {
    //   return res.status(401).json({ message: 'Invalid password' });
    // }

    const adminObj = existingAdmin.toObject();
    delete adminObj.password;

    const accessToken = generateAccessToken(adminObj._id);
    const refreshToken = generateRefreshToken(adminObj._id, 'admin');

    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(200).json({
      message: 'Login successful',
      data: {
        admin: adminObj,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const adminLogout = globalLogout;
// no await bcs we pass reff not calling fnx
