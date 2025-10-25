import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { jobPostBodySchema } from '../../validator/postValid.js';

export const post = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const auth = await AuthUser.findById(req.auth._id).select('_id isBlocked role');
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

    if (cleaned.location) {
      cleaned.location = Object.fromEntries(
        Object.entries(cleaned.location).filter(([_, val]) => val !== undefined)
      );
    }

    const created = await JobPost.create({
      employerId: user._id,
      ...cleaned,
    });

    if (!created) {
      throw new AppError('Failed to create post', { status: 500 });
    }

    const responseBody = {
      _id: created._id,
      employerId: created.employerId,
      category: created.category,
      skills: created.skills,
      description: created.description,
      budgetAmount: created.budgetAmount,
      location: created.location,
      schedule: created.schedule,
      status: created.status,
      employerAssets: created.employerAssets,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
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
