import mongoose from 'mongoose';
import { AuthUser } from '../../models/authModel.js';
import { AppError } from '../../utils/apiError.js';
import { JobPost } from '../../models/postModel.js';
import { EmployerProfile } from '../../models/employerModel.js';

export const deletePost = async (req, res, next) => {
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
      throw new AppError('Only employer can change job status', {
        status: 403,
      });
    }

    const employer = await EmployerProfile.findOne({ userId: auth._id })
      .select('_id')
      .lean();
    if (!employer) {
      throw new AppError('Employer profile not found', { status: 404 });
    }

    const { jobId } = req.params;

    if (!jobId) {
      throw new AppError('Job ID required', { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new AppError('Invalid jobId', { status: 400 });
    }

    const job = await JobPost.findOneAndDelete({
      _id: jobId,
      employerId: employer._id,
    });

    // isDeleted: { type: Boolean, default: false }, deletedAt: Date
    // const job = await JobPost.findOneAndUpdate(
    //   { _id: jobId, employerId: employer._id, isDeleted: { $ne: true } },
    //   { $set: { isDeleted: true, deletedAt: new Date() } },
    //   { new: true, projection: '_id isDeleted' }
    // ).lean();

    if (!job) {
      throw new AppError('Job not found or not owned by employer', {
        status: 404,
      });
    }

    return res.status(200).json({ message: 'Job post deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
