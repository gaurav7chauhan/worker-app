import { User } from '../../models/user.model.js';

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const deleteUser = await User.findByIdAndDelete(userId);

    if (!deleteUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res
      .status(200)
      .json({ message: 'User account deleted successfully' });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message || 'Internal server error' });
  }
};
