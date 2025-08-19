import { User } from '../../models/user.model.js';

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { userType, isBlocked } = req.query;

    let filter = {};

    if (userType) {
      filter.userType = userType;
    }

    if (typeof isBlocked !== 'undefined') {
      filter.isBlocked = isBlocked === 'true';
    }

    const users = await User.find(filter).select('-password');

    return res.status(200).json({
      message: 'Users fetched successfully',
      data: {
        users,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};
