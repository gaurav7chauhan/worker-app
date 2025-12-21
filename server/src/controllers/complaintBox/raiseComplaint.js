import mongoose from 'mongoose';
import { AppError } from '../../utils/apiError.js';
import { complaintZod } from '../../validator/compValid.js';
import { ReqComplaint } from '../../models/complaintSchema.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const raiseComplaint = asyncHandler(async (req, res) => {
  // auth & body validation
  const currentUser = req.authUser?._id;

  const parsed = complaintZod.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new AppError(first?.message || 'Invalid input data.', {
      status: 422,
    });
  }

  const { targetUserId, reqUserId, note } = parsed.data;

  // id & ownership checks
  if (
    !mongoose.isValidObjectId(targetUserId) ||
    !mongoose.isValidObjectId(reqUserId)
  ) {
    throw new AppError('Invalid user ID.', { status: 422 });
  }

  if (currentUser.toString() !== reqUserId) {
    throw new AppError('Unauthorized user.', { status: 401 });
  }

  // payload preparation
  const uploadData = {
    targetUserId,
    reqUserId,
    note,
  };

  if (parsed.data.proofs) {
    uploadData.proofs = parsed.data.proofs;
  }

  // db upsert
  const createDoc = await ReqComplaint.findOneAndUpdate(
    uploadData,
    { $set: uploadData },
    { upsert: true, new: true }
  ).lean();

  if (!createDoc) {
    throw new AppError('Complaint could not be created.', { status: 500 });
  }

  // response
  const isUpdated = createDoc ? true : false;

  return res.status(isUpdated ? 200 : 201).json({
    message: isUpdated
      ? 'Complaint updated successfully.'
      : 'Complaint created successfully.',
    complaint: createDoc,
  });
});
