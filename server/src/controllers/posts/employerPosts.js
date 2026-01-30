import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { pagination } from '../../validator/pagingPosts_valid.js';

export const employerPosts = asyncHandler(async (req, res) => {
  const authUser = req.authUser;
  const employer = await EmployerProfile.findOne({ userId: authUser._id })
    .select('_id')
    .lean();
  if (!employer) {
    throw new AppError('Employer not found', { status: 404 });
  }

  const sorting = pagination.safeParse(req.query);
  if (!sorting.success) {
    const first = sorting.error.issues[0];
    throw new AppError(`${first.message} in ${first.path}`);
  }

  const { onlyLatest, limit, page, sort } = sorting.data;

  const sortObject = sort === 'latest' ? { createdAt: -1 } : { createdAt: 1 };

  let finalLimit;
  let skip;

  if (onlyLatest === true) {
    finalLimit = 1;
    skip = 0;
  } else {
    finalLimit = limit;
    skip = (page - 1) * limit;
  }

  const posts = await JobPost.find({ employerId: employer._id })
    .sort(sortObject)
    .skip(skip)
    .limit(finalLimit)
    .select(
      '-assignedWorkerId -completionProofs -submittedAt -employerConfirmBy -approvedAt -reviewWindowEnd'
    )
    .populate('employerId', 'fullName avatarUrl email')
    .lean();

  return res
    .status(200)
    .json({ message: 'Employer Posts successfully fetched', posts });
});
