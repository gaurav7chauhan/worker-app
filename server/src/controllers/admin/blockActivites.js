
import { User } from '../../models/user.model.js';

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = false;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};
