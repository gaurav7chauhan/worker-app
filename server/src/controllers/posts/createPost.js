import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { uploadOnCloudinary } from '../../config/cloudinaryConfig.js';
import { jobPostBodySchema } from '../../validator/post_valid.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

function parseArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [value];
  }
}

export const createPost = asyncHandler(async (req, res) => {
  // authenticated user (from requireActiveUser)
  const authUser = req.authUser;

  if (authUser.role !== 'employer') {
    throw new AppError('Post can be updated by only employer', { status: 403 });
  }

  // 3) Ensure employer profile exists
  const user = await EmployerProfile.findOne({ userId: authUser._id })
    .select('_id')
    .lean();

  if (!user) {
    throw new AppError('Employer not found', { status: 404 });
  }

  // converting data into there respective types...
  const raw = req.body;
  
  raw.category = parseArrayField(raw.category);
  raw.skills = parseArrayField(raw.skills);
  
  // location coordinates (string → number)
  if (typeof raw.location === 'string') {
    try {
      raw.location = JSON.parse(raw.location);
    } catch {
      raw.location = undefined;
    }
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
  if (Object.keys(cleaned).length === 0) {
    throw new AppError('No valid fiels provided for update', { status: 400 });
  }

  // 6) Handle employer asset uploads (max 5)
  let employerAssets = [];

  if (req.files?.length) {
    if (req.files.length > 5) {
      throw new AppError('Maximum 5 employer assets allowed.', {
        status: 400,
      });
    }

    for (const file of req.files) {
      const media = await uploadOnCloudinary(file.buffer, file.mimetype, {
        folder: 'jobs/employer-assets',
        public_id: `job_${authUser._id}_${Date.now()}`,
      });

      if (!media?.secure_url) {
        throw new AppError('Cloud upload failed', { status: 502 });
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
  // const responseBody = {
  //   category: created.category,
  //   skills: created.skills,
  //   description: created.description,
  //   budgetAmount: created.budgetAmount,
  //   address: created.address,
  //   location: geoLocation,
  //   schedule: created.schedule,
  //   status: created.status,
  //   createdAt: created.createdAt,
  //   updatedAt: created.updatedAt,
  //   employerAssets: created.employerAssets,
  // };

  return res.status(201).json({
    message: 'User successfully created post',
  });
});
