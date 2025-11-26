import { ReqComplaint } from '../../models/complaintSchema';
import { AppError } from '../../utils/apiError.js';
import { filterComplaintZod } from '../../validator/compValid.js';

export const listComplaintsAgainstMe = async (req, res, next) => {
  try {
    const authId = req.authUser?._id;
    const parsed = filterComplaintZod.safeParse(req.query);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(first?.message || 'Invalid input data', {
        status: 422,
      });
    }

    const { limit, page, status } = parsed.data;

    const filters = { targetUserId: authId };
    if (status) {
      filters.status = status;
    }

    const [items, totalDoc] = await Promise.all([
      ReqComplaint.find(filters)
        .populate({
          path: 'reqUserId',
          select: 'fullName email role',
        })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),

      ReqComplaint.countDocuments(filters),
    ]);

    if (totalDoc === 0) {
      return res.status(200).json({
        message: 'No complaints found.',
        limit,
        page,
        total: 0,
        totalPages: 0,
      });
    }

    return res.status(200).json({
      message: 'Complaints fetched successfully.',
      complaints: items,
      total: totalDoc,
      page,
      limit,
      totalPages: Math.ceil(totalDoc / limit),
    });
  } catch (e) {
    return next(e);
  }
};
