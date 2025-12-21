import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';

export const switchRole = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;
  
  // 3) Validate target role
  const role = req.params.role?.trim();
  if (!['Employer', 'Worker'].includes(role)) {
    throw new AppError('Invalid role', { status: 400 });
  }

  const targetRole = role;

  // 4) Determine source and target profile models
  const Source = targetRole === 'Employer' ? WorkerProfile : EmployerProfile;
  const Target = targetRole === 'Employer' ? EmployerProfile : WorkerProfile;

  // 5) Fetch source profile (if exists) to seed common fields
  const sourceUser = await Source.findOne({ userId: authUser._id })
    .select('fullName address languages avatarUrl coverUrl')
    .lean();

  const seed = {
    userId: authUser._id,
    fullName: sourceUser?.fullName || '',
    address: sourceUser?.address || null,
    languages: sourceUser?.languages?.length ? sourceUser.languages : ['hindi'],
    avatarUrl: sourceUser?.avatarUrl || '',
    coverUrl: sourceUser?.coverUrl || '',
  };

  // 6) Create target profile if not exists (idempotent)
  const profile = await Target.findOneAndUpdate(
    { userId: authUser._id },
    { $setOnInsert: seed },
    { new: true, upsert: true }
  )
    .select('-userId -internalStats')
    .lean();

  // 7) Update role in auth user if changed
  if (authUser.role !== targetRole) {
    authUser.role = targetRole;
    await authUser.save();
  }

  // 8) Respond with updated role and profile
  return res.status(200).json({
    role: targetRole,
    profile,
    message: 'Role switched successfully',
  });
});
