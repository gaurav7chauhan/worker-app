import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';

export const statusUpdate = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const auth = await AuthUser.findById(req.auth._id)
      .select('_id role isBlocked')
      .lean();
    if (!auth) throw new AppError('User not found');
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }
    if (auth.role != 'Employer') {
      throw new AppError('Only Employer change the settings', { status: 401 });
    }

    const user = await EmployerProfile.findOne({ userId: auth._id })
      .select('_id')
      .lean();
    if (!user) {
      throw new AppError('Employer profile not found', { status: 404 });
    }

    const { jobId, status } = req.query;

    if (status === 'Completed') {
      return res.status(200).json({ message: 'Post already completed' });
    }

    const userPost = await JobPost.findOne({
      _id: jobId,
      employerId: user._id,
      status: 'Open',
    })
      .select('_id status')
      .lean();

    if (!userPost) {
      throw new AppError('User Post not found', { status: 404 });
    }
  } catch (error) {
    return next(error);
  }
};
