import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';

export const switchRole = async (req, res, next) => {
  try {
    if (!req.auth?._id)
      throw new AppError('Authentication required', { status: 401 });

    const authUser = await AuthUser.findById(req.auth._id).select(
      'isBlocked role'
    );

    if (!authUser) throw new AppError('Auth user not found', { status: 404 });
    if (authUser.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    // in which account user wants to switch
    const targetRole = req.params.role === 'Employer' ? 'Employer' : 'Worker';
    const Source = targetRole === 'Employer' ? WorkerProfile : EmployerProfile;
    const targetUser = targetRole === 'Employer' ? EmployerProfile : WorkerProfile;

    const sourceUser = await Source
      .findOne({ userId: authUser._id })
      .select('fullName area languages avatarUrl')
      .lean();

    const seed = {
      userId: authUser._id,
      fullName: sourceUser?.fullName || '',
      area: sourceUser?.area || null,
      languages:
        sourceUser?.languages && sourceUser.languages.length
          ? sourceUser.languages
          : ['hindi'],
      avatarUrl: sourceUser?.avatarUrl || '',
      coverUrl: sourceUser?.coverUrl || '',
    };

    const profile = await targetUser
      .findOneAndUpdate(
        { userId: authUser._id },
        { $setOnInsert: seed },
        { new: true, upsert: true }
      )
      // .select('fullName area languages avatarUrl userId')
      .lean();

    if (authUser.role !== targetRole) {
      authUser.role = targetRole;
      await authUser.save();
    }

    return res.status(200).json({
      role: targetRole,
      profile,
      message: 'Role switched successfully',
    });
  } catch (e) {
    return next(e);
  }
};
