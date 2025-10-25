import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';

export const editPost = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const auth = await AuthUser.findById(req.auth._id)
      .select('_id role isBlocked')
      .lean();
    if (!auth) throw new AppError('User not found', { status: 404 });
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }
    if (auth.role !== 'Employer') {
      throw new AppError('Only employer can change job status', {
        status: 403,
      });
    }
  } catch (error) {
    return next(error);
  }
};
