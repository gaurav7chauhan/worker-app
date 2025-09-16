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
      throw new AppError('User not found', { status: 400 });
    }

    const authUser = await AuthUser.findById(req.auth._id).select(
      'email isBlocked role'
    );

    if (!authUser) {
      throw new AppError('User not found', { status: 404 });
    }

    if (authUser.isBlocked) {
      throw new AppError('Sorry, you are blocked by admin.', { status: 409 });
    }

    const schema = authUser.role === 'Employer' ? employerUpdate : workerUpdate;

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(first?.message, { status: 400 });
    }

    const cleaned = Object.fromEntries(
      Object.entries(parsed.data).filter(([_, v]) => v !== undefined)
    );

    if (cleaned.address) {
      cleaned.address = Object.fromEntries(
        Object.entries(cleaned.address).filter(([_, v]) => v !== undefined)
      );
    }

    const model = authUser.role === 'Employer' ? EmployerProfile : WorkerProfile;
    const profile = await model.findOneAndUpdate(
      { email: authUser.email },
      { $set: cleaned },
      { new: true, runValidators: true }
    );

    if (!profile) {
      throw new AppError('Profile not found', { status: 404 });
    }

    return res
      .status(200)
      .json({ profile, message: 'Profile successfully updated' });
  } catch (e) {
    return next(e);
  }
};
