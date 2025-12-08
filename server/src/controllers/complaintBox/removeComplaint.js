import mongoose from 'mongoose';
import { AppError } from '../../utils/apiError.js';
import { ReqComplaint } from '../../models/complaintSchema.js';

export const removeComplaint = async (req, res, next) => {
  try {
    const user = req.authUser?._id;

    const { complaintId } = req.params;
    if (!complaintId) {
      throw new AppError('Complaint ID required.', { status: 400 });
    }
    if (!mongoose.isValidObjectId(complaintId)) {
      throw new AppError('Invalid complaint ID.', { status: 422 });
    }

    const doc = await ReqComplaint.findOne({
      _id: complaintId,
      reqUserId: user,
    }).select('status');

    if (!doc)
      throw new AppError('Complaint document or user not found', {
        status: 404,
      });
    if (doc.status === 'rejected' || doc.status === 'resolved') {
      throw new AppError('Resolved or rejected complaints cannot be deleted.', {
        status: 400,
      });
    }

    await ReqComplaint.deleteOne({ _id: complaintId, reqUserId: user });

    return res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (e) {
    return next(e);
  }
};
