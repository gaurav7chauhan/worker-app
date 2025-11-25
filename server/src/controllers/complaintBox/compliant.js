import mongoose from 'mongoose';
import { AppError } from '../../utils/apiError.js';
import { complaintZod } from '../../validator/compValid.js';
import { ReqComplaint } from '../../models/complaintSchema.js';

export const raiseComplaint = async (req, res, next) => {
  try {
    const currentUser = req.authUser;

    const parsed = complaintZod.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(first?.message || 'Invalid input data.', {
        status: 422,
      });
    }

    const { targetUserId, reqUserId, note } = parsed.data;

    if (
      !mongoose.isValidObjectId(targetUserId) ||
      !mongoose.isValidObjectId(reqUserId)
    ) {
      throw new AppError('Invalid user ID.', { status: 422 });
    }

    if (currentUser.toString() !== reqUserId) {
      throw new AppError('Unauthorized user.', { status: 401 });
    }

    const uploadData = {
      targetUserId: targetUserId,
      reqUserId: reqUserId,
      note: note,
    };

    if (parsed.data.proofs) {
      uploadData.proofs = parsed.data.proofs;
    }

    const createDoc = await ReqComplaint.findOneAndUpdate(
      uploadData,
      { $set: uploadData },
      { upsert: true, new: true }
    ).lean();

    if (!createDoc) {
      throw new AppError('Complaint could not be created.', { status: 500 });
    }

    const isUpdated = createDoc ? true : false;

    return res
      .status(isUpdated ? 200 : 201)
      .json({
        message: isUpdated
          ? 'Complaint updated successfully.'
          : 'Complaint created successfully.',
        complaint: createDoc,
      });
  } catch (e) {
    return next(e);
  }
};
