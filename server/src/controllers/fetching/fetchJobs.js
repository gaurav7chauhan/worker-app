import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { JobPost } from '../../models/postModel.js';
import { AppError } from '../../utils/apiError.js';
import { jobFilterSchema } from '../../validator/fetchValid.js';

export const filterJobs = async (req, res, next) => {
  try {
    const { _id, role } = req.authUser;

    const parsed = jobFilterSchema.safeParse(req.body);

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(first?.message || 'Invalid input data.', {
        status: 422,
      });
    }

    const cleaned = Object.fromEntries(
      Object.entries(parsed.data).filter(([_, v]) => v !== undefined)
    );

    const filter = {};
    if (cleaned.category?.length) filter.category = { $in: cleaned.category };
    // skills: if you want must-have all skills (AND)
    if (cleaned.skills?.length) filter.skills = { $all: cleaned.skills };
    // direct fields
    if (cleaned.city) filter.city = cleaned.city;
    if (cleaned.state) filter.state = cleaned.state;
    if (cleaned.status) filter.status = cleaned.status;
    if (cleaned.payType) filter.payType = cleaned.payType;

    // geo
    if (cleaned.location) {
      if (!cleaned.minDistanceKm && !cleaned.maxDistanceKm) {
        const DEFAULT_RADIUS = 10; // kilometers
        filter.location = {
          $near: {
            $geometry: cleaned.location,
            $maxDistance: DEFAULT_RADIUS * 1000, // meters
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

    // budget
    if (cleaned.budgetMin != null || cleaned.budgetMax != null) {
      const range = {};
      if (cleaned.budgetMin != null) range.$gte = cleaned.budgetMin;
      if (cleaned.budgetMax != null) range.$lte = cleaned.budgetMax;
      filter.budgetAmount = range;
    }

    let descending;
    if (cleaned.recent === true) {
      descending = Number(-1);
    }

    // let s = "-createdAt,name"
    const parseSort = (s) => {
      (s || '')
        .split(',')
        .filter(Boolean)
        .reduce((acc, key) => {
          key = key.trim();
          if (!key) return acc;
          if (key.startsWith('-')) acc[key.slice(1)] = -1;
          else acc[key] = 1;
          return acc;
        }, {});
    };

    let sortStr = cleaned.sort;
    if (!sortStr.trim() && cleaned.recent === true) {
      sortStr = '-createdAt';
    }

    const sort = parseSort(sortStr || '-createdAt');

    const fields = cleaned.fields
      ? cleaned.fields
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join(' ')
      : 'category skills description budgetAmount city state payType';

    const page = cleaned.page ?? 1;
    const limit = cleaned.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      JobPost.find(filter)
        .select(`employerId ${fields}`)
        .populate({ path: 'employerId', select: 'fullName' })
        .sort(sort)
        .skip(skip)
        .limit(limit),

      JobPost.countDocuments(filter),
    ]);
  } catch (e) {
    return next(e);
  }
};
