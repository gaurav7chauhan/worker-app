import { UserBio } from '../../models/bioModel.js';
import { userBioSchema } from '../../validators/userValidate.js';

export const updateUserBio = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No data provided' });
    }

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = userBioSchema.safeParse(req.body);

    if (!result.success) {
      console.log(result.error.issues);
      return res.status(400).json({
        message: `${
          result.error.issues[0].message
        } on ${result.error.issues[0].path.join('.')}`,
      });
    }

    const updatedFields = Object.fromEntries(
      // it transform [] to {}
      Object.entries(result.data).filter(
        // it tranform {} to []
        ([_, value]) => value !== undefined && value !== null
      )
    );

    if (Object.keys(updatedFields).length < 1) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updateResult = await UserBio.updateOne(
      { owner: userId },
      { $set: updatedFields },
      { upsert: true }
    );

    if (updateResult.upsertedCount > 0) {
      const newUserData = await UserBio.findOne({ owner: userId });

      return res.status(201).json({
        message: 'User Bio created successfully',
        data: newUserData,
      });
    } else if (updateResult.matchedCount > 0) {
      const updatedUserData = await UserBio.findOne({ owner: userId });

      return res.status(200).json({
        message: 'User Bio updated successfully',
        data: updatedUserData,
      });
    } else {
      return res
        .status(500)
        .json({ message: 'Unexpected error during update' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
