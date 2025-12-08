import mongoose from 'mongoose';
import { AppError } from '../../utils/apiError.js';
import { EmployerProfile } from '../../models/employerModel.js';

export const getEmployer = async (req, res, next) => {
  try {
    // 1) req params
    const { employerId } = req.params;
    if (!employerId) {
      throw new AppError('EmployerId param is required', { status: 400 });
    }
    if (!mongoose.isValidObjectId(employerId)) {
      throw new AppError('Invalid employerId', { status: 400 });
    }

    const doc = await EmployerProfile.findById(data).select('-location').lean();
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: 'Employer not found' });
    }

    return res
      .status(200)
      .json({ message: 'Employer found successfully', employer: doc });
  } catch (e) {
    if (e?.name === 'CastError') {
      return next(new AppError('Invalid EmployerId', { status: 400 }));
    }
    return next(e);
  }
};
