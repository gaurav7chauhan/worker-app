import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';
import {
  employerUpdate,
  workerUpdate,
} from '../../validator/updateValidate.js';

export const updateUserProfile = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new AppError('Authentication required. Please log in again.', {
        status: 401,
      });
    }

    const authUser = await AuthUser.findById(req.auth._id).select(
      'isBlocked role'
    );

    if (!authUser) {
      throw new AppError('User account not found.', { status: 404 });
    }

    if (authUser.isBlocked) {
      throw new AppError(
        'Your account is currently blocked by the administrator.',
        { status: 403 }
      );
    }

    const schema = authUser.role === 'Employer' ? employerUpdate : workerUpdate;
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(first?.message || 'Invalid input data.', {
        status: 422,
      });
    }

    const cleaned = Object.fromEntries(
      Object.entries(parsed.data).filter(([_, v]) => v !== undefined)
    );

    if (cleaned.address) {
      cleaned.address = Object.fromEntries(
        Object.entries(cleaned.address).filter(([_, v]) => v !== undefined)
      );
    }

    const model =
      authUser.role === 'Employer' ? EmployerProfile : WorkerProfile;

    const profile = await model.findOneAndUpdate(
      { userId: authUser._id },
      { $set: cleaned },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!profile) {
      throw new AppError('Profile record not found.', { status: 404 });
    }

    return res.status(200).json({
      success: true,
      profile,
      message: 'Your profile has been updated successfully.',
    });
  } catch (e) {
    return next(e);
  }
};
