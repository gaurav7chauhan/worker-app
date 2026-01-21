import mongoose from 'mongoose';
import { uploadOnCloudinary } from '../../config/cloudinaryConfig.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { updatePostSchema } from '../../validator/postUpdate_valid.js';

export const postUpdate = asyncHandler(async (req, res) => {
  const authUser = req.authUser;
  if (authUser.role !== 'employer') {
    throw new AppError('Post can be updated by only employer', { status: 403 });
  }

  const user = await EmployerProfile.findOne({ userId: authUser._id })
    .select('_id')
    .lean();

  if (!user) {
    throw new AppError('Employer not found', { status: 404 });
  }

  const { jobId } = req.params;
  if (!jobId || !mongoose.isValidObjectId(jobId)) {
    throw new AppError('Invalid or missing Job ID', { status: 400 });
  }

  const job = await JobPost.findOne({ _id: jobId, employerId: user._id })
    .select('_id')
    .lean();
  if (!job) {
    throw new AppError('Job not found or not owned by employer', {
      status: 404,
    });
  }

  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new AppError(
      `${first?.message} in ${first?.path}` || 'Invalid post data',
      { status: 422 }
    );
  }

  const cleaned = Object.fromEntries(
    Object.entries(parsed.data).filter(([_, val]) => val !== undefined)
  );

  if (Object.keys(cleaned).length === 0) {
    throw new AppError('No valid fiels provided for update', { status: 400 });
  }

  // image logic handle
  let employerAssets = cleaned.employerAssets ?? null;

  if (cleaned.employerAssets !== undefined || req.files?.length) {
    employerAssets = Array.isArray(cleaned.employerAssets)
      ? [...cleaned.employerAssets]
      : [];

    if (req.files?.length) {
      if (employerAssets.length + req.files.length > 5) {
        throw new AppError('Maximum 5 employer assets allowed.', {
          status: 400,
        });
      }

      for (const file of req.files) {
        const media = await uploadOnCloudinary(
          file.path,
          'image',
          file.mimetype,
          {
            folder: 'jobs/employer-assets',
            public_id: `job_${authUser._id}_${Date.now()}`,
          }
        );
        if (!media || !media.secure_url) {
          throw new AppError('Image upload failed', { status: 422 });
        }

        employerAssets.push({
          url: media.secure_url,
          type: 'image',
          meta: `width:${media.width},height:${media.height},mime:${media.resource_type},size:${media.bytes}`,
        });
      }
    }
    cleaned.employerAssets = employerAssets;
  }

  // address
  if (cleaned.address) {
    cleaned.address = Object.fromEntries(
      Object.entries(cleaned.address).filter(([_, val]) => val !== undefined)
    );
  }

  // location
  let geoLocation = null;
  if (cleaned.location) {
    const [lat, lng] = cleaned.location.coordinates;
    geoLocation = {
      type: cleaned.location.type,
      coordinates: [lat, lng],
    };
    cleaned.location = geoLocation;
  }

  const update = await JobPost.findOneAndUpdate(
    { _id: jobId, employerId: user._id },
    { $set: cleaned },
    { new: true, runValidators: true }
  );
  if (!update) {
    throw new AppError('No valid fields provided for update', { status: 500 });
  }
  return res.status(200).json({ message: 'Post successfully updated' });
});
