import { AuthUser } from '../models/authModel.js';
import { AppError } from '../utils/apiError.js';

export const userValidation = async (req) => {
  if (!req.auth?._id) {
    throw new AppError('Authentication required', { status: 401 });
  }

  const authUser = await AuthUser.findById(req.auth._id).lean();

  if (!authUser) throw new AppError('User not found', { status: 404 });

  if (authUser.isBlocked) {
    throw new AppError('Account is blocked by admin', { status: 403 });
  }

  return authUser;
};
