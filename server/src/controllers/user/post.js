import { AuthUser } from '../../models/authModel.js';
import { AppError } from '../../utils/apiError.js';
import { jobPostBodyUser } from '../../validator/postValidate.js';

export const post = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const auth = await AuthUser.findById(req.auth._id).select('isBlocked role');
    if (auth.role !== 'Employer') {
      throw new AppError('Post is created by only employer', { status: 409 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const payload = jobPostBodyUser.safeParse(req.body);
    if (!payload.success) {
      throw new AppError(`${payload.error.issues[0].message}`);
    }

    const cleaned = Object.fromEntries(
      Object.entries(payload.data).filter(([_, val]) => val !== undefined)
    );
  } catch (error) {
    return next(error);
  }
};
