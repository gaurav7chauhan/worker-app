import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { pagination } from '../../validator/pagingPosts_valid.js';

export const allPosts = asyncHandler(async (req, res) => {
  const sorting = pagination.safeParse(req.query);
  if (!sorting.success) {
    const first = sorting.error.issues[0];
    throw new AppError(`${first.message} in ${first.path}`);
  }

  const publicAllowedStatus = ['Open', 'Closed', 'Completed'];

  const { statusType } = req.params;
  if (!publicAllowedStatus.includes(statusType)) {
    throw new AppError('This status is not publicly accessible', {
      status: 403,
    });
  }

  const { limit, page, sort } = sorting.data;

  const sortObject = sort === 'latest' ? { createdAt: -1 } : { createdAt: 1 };

  const skip = (page - 1) * limit;

  const projection =
    statusType !== 'Completed'
      ? '-assignedWorkerId -completionProofs -submittedAt -employerConfirmBy -approvedAt -reviewWindowEnd'
      : undefined;

  const jobPosts = await JobPost.find({ status: statusType })
    .sort(sortObject)
    .skip(skip)
    .limit(limit)
    .select(projection)
    .lean();

  return res
    .status(200)
    .json({ message: 'Posts successfully fetched', jobPosts });
});
