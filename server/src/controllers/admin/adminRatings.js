import { User } from '../../models/user.model.js';

export const deleteUserAvgRating = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        averageRating: null,
      },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User average ratings not deleted or not found' });
    }

    return res
      .status(200)
      .json({ message: 'User average ratings deleted successfully' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const deleteUserHistoryRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ratings: [],
      },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User ratings not deleted or not found' });
    }

    return res
      .status(200)
      .json({ message: 'User ratings deleted successfully' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};
