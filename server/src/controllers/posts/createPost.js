import { parseLocation } from '../../common/mainLocation.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { uploadOnCloudinary } from '../../config/cloudinaryConfig.js';
import { jobPostBodySchema } from '../../validator/post_valid.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const createPost = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  if (authUser.role === 'worker') {
    throw new AppError('Post can be created only by employer', {
      status: 409,
    });
  }

  // 3) Ensure employer profile exists
  const user = await EmployerProfile.findOne({ userId: authUser._id });
  if (!user) {
    throw new AppError('Employer not found', { status: 404 });
  }

  // converting data into there respective types...
  const raw = req.body;
  if (raw.skills && typeof raw.skills === 'string') {
    try {
      raw.skills = JSON.parse(raw.skills);
    } catch {
      raw.skills = [];
    }
  }

  if (raw.budgetAmount) {
    raw.budgetAmount = Number(raw.budgetAmount);
  }

  if (raw.location.coordinates) {
    raw.location.coordinates[0] = Number(raw.location.coordinates[0]);
    raw.location.coordinates[1] = Number(raw.location.coordinates[1]);
  }

  // 4) Validate request body
  const parsed = jobPostBodySchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new AppError(
      `${first?.message} in ${first?.path}` || 'Invalid post data',
      { status: 422 }
    );
  }

  // 5) Remove undefined fields
  const cleaned = Object.fromEntries(
    Object.entries(parsed.data).filter(([_, val]) => val !== undefined)
  );

  // 6) Handle employer asset uploads (max 5)
  let employerAssets = [];
  if (cleaned.employerAssets && req.files?.length) {
    if (req.files.length > 5) {
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

      if (!media) {
        throw new AppError('Images did not meet upload policy', {
          status: 422,
        });
      }
      if (!media.secure_url) {
        throw new AppError('Cloud upload returned no URL', { status: 502 });
      }

      employerAssets.push({
        url: media.secure_url,
        type: 'image',
        meta: `width:${media.width},height:${media.height},mime:${media.resource_type},size:${media.bytes}`,
      });
    }

    cleaned.employerAssets = employerAssets;
  }

  // 7) Clean nested address object
  if (cleaned.address) {
    cleaned.address = Object.fromEntries(
      Object.entries(cleaned.address).filter(([_, val]) => val !== undefined)
    );
  }

  // 8) Parse geo location if provided
  let geoLocation = null;
  if (cleaned.location) {
    const [lng, lat] = cleaned.location.coordinates;
    geoLocation = { type: cleaned.location.type, coordinates: [lng, lat] };
  }

  // 9) Create job post
  const created = await JobPost.create({
    employerId: user._id,
    ...cleaned,
    location: geoLocation,
  });

  if (!created) {
    throw new AppError('Failed to create post', { status: 500 });
  }

  // 10) Build safe response payload
  const responseBody = {
    category: created.category,
    skills: created.skills,
    description: created.description,
    budgetAmount: created.budgetAmount,
    address: created.address,
    location: geoLocation,
    schedule: created.schedule,
    status: created.status,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    employerAssets: created.employerAssets,
  };

  return res.status(201).json({
    message: 'User successfully created post',
    responseBody,
  });
});
