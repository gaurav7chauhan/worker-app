import { ReqComplaint } from '../../models/complaintSchema.js';

export const getComplaints = async (req, res, next) => {
  try {
    const { status } = req.params;
    if (status) {
      const [doc, total] = await Promise.all([
        ReqComplaint.find({ status: status })
          .select('targetUserId reqUserId status')
          .populate({ path: targetUserId, select: 'email role isBlocked' })
          .populate({ path: reqUserId, select: 'email role isBlocked' })
          .lean(),

        ReqComplaint.countDocuments({ status: status }),
      ]);
      if (total === 0) {
        return res.status(200).json({message: 'No, Complaints found', total});
      }
    }
  } catch (e) {
    return next(e);
  }
};
