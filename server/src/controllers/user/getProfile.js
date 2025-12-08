import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';

export const getProfile = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const auth = await AuthUser.findById(req.auth._id).select('isBlocked role');
    if (!auth) throw new AppError('User not found', { status: 404 });
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const targetRole =
      auth.role === 'Employer' ? EmployerProfile : WorkerProfile;

    const userProfile = await targetRole.findOne({ userId: auth._id });
    if (!userProfile) {
      throw new AppError('User profile not found', { status: 404 });
    }

    return res
      .status(200)
      .json({ userProfile, message: 'Profile successfully fetched' });
  } catch (error) {
    return next(error);
  }
};
