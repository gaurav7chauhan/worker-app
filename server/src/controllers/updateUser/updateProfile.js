import { EmployerProfile } from '../../models/employerModel.js';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';
import { uploadOnCloudinary } from '../../config/cloudinaryConfig.js';
import { employerUpdate, workerUpdate } from '../../validator/update_valid.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const updateProfile = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  // 3) Choose validation schema based on user role
  const schema = authUser.role === 'Employer' ? employerUpdate : workerUpdate;
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new AppError(first?.message || 'Invalid input data.', {
      status: 422,
    });
  }

  // 4) Remove undefined fields to avoid overwriting existing data
  const cleaned = Object.fromEntries(
    Object.entries(parsed.data).filter(([_, v]) => v !== undefined)
  );

  // 5) Clean nested location object (partial updates)
  if (cleaned.location) {
    cleaned.location = Object.fromEntries(
      Object.entries(cleaned.location).filter(([_, v]) => v !== undefined)
    );
  }

  // 6) Handle avatar upload if file is provided
  if (req.file) {
    const media = await uploadOnCloudinary(
      req.file.path,
      'image',
      req.file.mimetype,
      {
        folder: 'users/avatar',
        public_id: `avatar_${authUser._id}`,
      }
    );

    if (!media) {
      throw new AppError('Avatar did not meet upload policy', {
        status: 422,
      });
    }

    if (!media.secure_url) {
      throw new AppError('Cloud upload returned no URL', { status: 502 });
    }

    cleaned.avatarUrl = media.secure_url;
  }

  // 7) Pick profile model based on role
  const model = authUser.role === 'Employer' ? EmployerProfile : WorkerProfile;

  // 8) Update profile and return updated document
  const profile = await model
    .findOneAndUpdate(
      { userId: authUser._id },
      { $set: cleaned },
      { new: true, runValidators: true, context: 'query' }
    )
    .select(
      '-onTimeRate -ratingAvg -ratingCount -repeatClientRate -userId -badges'
    );

  if (!profile) {
    throw new AppError('Profile record not found.', { status: 404 });
  }

  // 9) Send success response
  return res.status(200).json({
    success: true,
    message: 'Your profile has been updated successfully.',
    profile,
  });
});
