import mongoose from 'mongoose';
import { AppError } from '../../utils/apiError.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const getEmployer = asyncHandler(async (req, res, next) => {
  // params validation
  const { employerId } = req.params;
  if (!employerId) {
    throw new AppError('EmployerId param is required', { status: 400 });
  }
  if (!mongoose.isValidObjectId(employerId)) {
    throw new AppError('Invalid employerId', { status: 400 });
  }

  // db query
  const doc = await EmployerProfile.findById(employerId)
    .select('-location')
    .lean();

  if (!doc) {
    return res
      .status(404)
      .json({ success: false, message: 'Employer not found' });
  }

  // response
  return res.status(200).json({
    message: 'Employer found successfully',
    employer: doc,
  });
});
