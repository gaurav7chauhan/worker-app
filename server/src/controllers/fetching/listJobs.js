import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { jobFilterSchema } from '../../validator/fetch_valid.js';

export const listJobs = asyncHandler(async (req, res) => {
  // query validation
  const parsed = jobFilterSchema.safeParse(req.query);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new AppError(first?.message || 'Invalid input data.', {
      status: 422,
    });
  }

  // clean undefined values
  const cleaned = Object.fromEntries(
    Object.entries(parsed.data).filter(([_, v]) => v !== undefined)
  );

  // filter building
  const filter = {};
  if (cleaned.category?.length) filter.category = { $in: cleaned.category };
  if (cleaned.skills?.length) filter.skills = { $in: cleaned.skills };
  if (cleaned.city) filter.city = cleaned.city;
  if (cleaned.state) filter.state = cleaned.state;
  if (cleaned.status) filter.status = cleaned.status;
  if (cleaned.payType) filter.payType = cleaned.payType;

  // geo filter
  if (cleaned.location) {
    if (!cleaned.minDistanceKm && !cleaned.maxDistanceKm) {
      filter.location = {
        $near: {
          $geometry: cleaned.location,
          $maxDistance: 10 * 1000,
        },
      };
    } else {
      const geoQuery = { $geometry: cleaned.location };
      if (cleaned.maxDistanceKm != null) {
        geoQuery.$maxDistance = cleaned.maxDistanceKm * 1000;
      }
      if (cleaned.minDistanceKm != null) {
        geoQuery.$minDistance = cleaned.minDistanceKm * 1000;
      }
      filter.location = { $near: geoQuery };
    }
  }

  // budget range
  if (cleaned.budgetMin != null || cleaned.budgetMax != null) {
    const range = {};
    if (cleaned.budgetMin != null) range.$gte = cleaned.budgetMin;
    if (cleaned.budgetMax != null) range.$lte = cleaned.budgetMax;
    filter.budgetAmount = range;
  }

  // sort & fields
  const parseSort = (s) =>
    (s || '')
      .split(',')
      .filter(Boolean)
      .reduce((acc, key) => {
        key = key.trim();
        if (!key) return acc;
        acc[key.startsWith('-') ? key.slice(1) : key] = key.startsWith('-')
          ? -1
          : 1;
        return acc;
      }, {});

  let sortStr = typeof cleaned.sort === 'string' ? cleaned.sort : '';
  if (!sortStr || (!sortStr.trim() && cleaned.recent === true)) {
    sortStr = '-createdAt';
  }

  const sort = parseSort(sortStr);
  const fields = cleaned.fields
    ? cleaned.fields
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(' ')
    : 'category skills description budgetAmount city state';

  // pagination
  const page = cleaned.page ?? 1;
  const limit = cleaned.limit ?? 5;
  const skip = (page - 1) * limit;

  // db fetch
  const [items, total] = await Promise.all([
    JobPost.find(filter)
      .select(`employerId ${fields} -reviewWindowEnd`)
      .populate({ path: 'employerId', select: 'fullName' })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    JobPost.countDocuments(filter),
  ]);

  if (items.length === 0) {
    return res
      .status(200)
      .json({ message: `There is no matching Job's for you.` });
  }

  // response
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    message: 'Jobs successfully fetched',
    jobs: items,
    total,
    page,
    limit,
    skip,
    totalPages,
  });
});
