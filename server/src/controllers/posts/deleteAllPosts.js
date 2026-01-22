import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';

export const deleteAllPosts = asyncHandler(async (req, res) => {
  if (req.query.confirm !== 'true') {
    throw new AppError('Confirmation required to delete all posts', {
      status: 400,
    });
  }

  const authUser = req.authUser;
  const employer = await EmployerProfile.findOne({ userId: authUser._id })
    .select('_id')
    .lean();

  if (!employer) {
    throw new AppError('Employer profile not found', { status: 404 });
  }

  const filter = {
    employerId: employer._id,
    status: { $in: ['Open', 'Closed', 'Canceled'] },
  };

  const result = await JobPost.deleteMany(filter);

  if (result.deletedCount === 0) {
    return res.status(200).json({
      message: 'No posts matched the delete criteria',
      deletedCount: 0,
    });
  }

  return res.status(200).json({
    message: 'Unsuccessful posts deleted successfully',
    deletedCount: result.deletedCount,
  });
});
