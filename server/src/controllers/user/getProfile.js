import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  // 3️⃣ Decide profile model based on role
  const ProfileModel =
    authUser.role === 'Employer' ? EmployerProfile : WorkerProfile;

  // 4️⃣ Fetch profile linked to auth user
  const userProfile = await ProfileModel.findOne({
    userId: authUser._id,
  });

  if (!userProfile) {
    throw new AppError('User profile not found', { status: 404 });
  }

  // 5️⃣ Success response
  return res.status(200).json({
    success: true,
    message: 'Profile successfully fetched',
    userProfile,
    userRole: authUser.role,
  });
});
