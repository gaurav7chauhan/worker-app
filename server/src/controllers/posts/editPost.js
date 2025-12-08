import mongoose from 'mongoose';
import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { editPostBodySchema } from '../../validator/editPost_valid.js';
import { parseLocation } from '../../common/mainLocation.js';

export const editPost = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    const auth = await AuthUser.findById(req.auth._id)
      .select('_id role isBlocked')
      .lean();
    if (!auth) throw new AppError('User not found', { status: 404 });
    if (auth.isBlocked) {
      throw new AppError('Account is blocked by admin', { status: 403 });
    }
    if (auth.role !== 'Employer') {
      throw new AppError('Only employer can edit job posts', {
        status: 403,
      });
    }

    const employerProfile = await EmployerProfile.findOne({
      userId: auth._id,
    }).lean();
    if (!employerProfile) {
      throw new AppError('Employer profile not found', { status: 404 });
    }

    const { jobId } = req.params;
    if (!jobId) throw new AppError('JobId is required', { status: 400 });
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new AppError('Invalid jobId', { status: 400 });
    }

    const job = await JobPost.findOne({
      _id: jobId,
      employerId: employerProfile._id,
    })
      .select('_id address status')
      .lean();

    if (!job) {
      throw new AppError('Job not found or not owned by employer', {
        status: 404,
      });
    }

    if (job.status !== 'Open') {
      throw new AppError('Only Open jobs can be edited', {
        status: 409,
      });
    }

    const parsed = editPostBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(
        `${first?.message} in ${first?.path}` || 'Invalid post data',
        { status: 422 }
      );
    }

    const newData = parsed.data;

    const cleaned = Object.fromEntries(
      Object.entries(parsed.data).filter(([_, val]) => val !== undefined)
    );

    if (cleaned.address) {
      cleaned.address = Object.fromEntries(
        Object.entries(cleaned.address).filter(([_, val]) => val !== undefined)
      );
    }

    const locationSent = Object.prototype.hasOwnProperty.call(
      cleaned,
      'location'
    );
    const addressSent = Object.prototype.hasOwnProperty.call(
      cleaned,
      'address'
    );

    if (locationSent) {
      const { lng, lat } = parseLocation(cleaned.location);
      newData.location = { type: 'Point', coordinates: [lng, lat] };
    }

    let newAddress = job.address;

    if (addressSent) {
      if (cleaned.address === null) {
        throw new AppError('address cannot be cleared', { status: 422 });
      } else if (cleaned.address && typeof cleaned.address === 'object') {
        newAddress = { ...job.address, ...cleaned.address };
        newData.address = newAddress;
      }
    }

    const updated = await JobPost.findByIdAndUpdate(
      job._id,
      {
        $set: { ...newData },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      throw new AppError('Job not found', { status: 404 });
    }

    return res
      .status(200)
      .json({ message: 'JobPost fields successfully changed', updated });
  } catch (error) {
    return next(error);
  }
};
