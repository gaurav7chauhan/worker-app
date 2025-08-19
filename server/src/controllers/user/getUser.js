import { User } from '../../models/user.model.js';
export const getUserProfile = async (req, res) => {
  try {
    const getUser = req.user;

    const userObj = getUser.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: 'User profile fetched successfully',
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message || 'Internal server error' });
  }
};
