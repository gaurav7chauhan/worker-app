import { parseLocation } from '../../common/mainLocation.js';
import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { uploadOnCloudinary } from '../../utils/cloudinaryConfig.js';
import { jobPostBodySchema } from '../../validator/post_valid.js';

export const createPost = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const auth = await AuthUser.findById(req.auth._id).select(
      '_id isBlocked role'
    );
    if (auth.role !== 'Employer') {
      throw new AppError('Post is created by only employer', { status: 409 });
    }
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }

    const user = await EmployerProfile.findOne({ userId: auth._id });
    if (!user) {
      throw new AppError('Employer not found', { status: 404 });
    }

    const parsed = jobPostBodySchema.safeParse(req.body);
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

    let employerAssets = [];
    if (cleaned.employerAssets) {
      if (req.files && req.files.length > 0) {
        if (req.files.length > 5) {
          throw new AppError('Maximum 5 employer assets allowed.', {
            status: 400,
          });
        }
        for (const file of req.files) {
          const media = await uploadOnCloudinary(
            file.path,
            'image',
            file.mimetype, //'image/jpeg' ya 'image/png'
            {
              folder: 'jobs/employer-assets',
              public_id: `job_${auth._id}_${Date.now()}`,
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
    }

    if (cleaned.address) {
      cleaned.address = Object.fromEntries(
        Object.entries(cleaned.address).filter(([_, val]) => val !== undefined)
      );
    }

    let geoLocation = null;

    if (cleaned.location) {
      const [lng, lat] = parseLocation(cleaned.location);
      geoLocation = { type: 'Point', coordinates: [lng, lat] };
    }

    const created = await JobPost.create({
      employerId: user._id,
      ...cleaned,
      location: geoLocation,
    });

    if (!created) {
      throw new AppError('Failed to create post', { status: 500 });
    }

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

    // res.set('Location', `/api/posts/${created._id}`); // adjust base path as needed

    return res.status(201).json({
      message: 'User successfully created post',
      responseBody,
    });
  } catch (error) {
    return next(error);
  }
};
