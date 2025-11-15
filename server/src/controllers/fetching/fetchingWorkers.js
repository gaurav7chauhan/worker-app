import mongoose from 'mongoose';
import { WorkerProfile } from '../../models/workerModel.js';
import { AppError } from '../../utils/apiError.js';
import { workerFilterSchema } from '../../validator/fetchValid.js';

export const filterWorkers = async (req, res, next) => {
  try {
    const parsed = workerFilterSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(first?.message || 'Invalid input data.', {
        status: 422,
      });
    }

    const cleaned = Object.fromEntries(
      Object.entries(parsed.data).filter((_, v) => v !== undefined)
    );

    const filter = {};
    // add in filter
    if (cleaned.openForWork != null) filter.openForWork = cleaned.openForWork;
    if (Array.isArray(cleaned.category) && cleaned.category.length) {
      filter.category = { $in: cleaned.category };
    }
    if (Array.isArray(cleaned.skills) && cleaned.skills.length) {
      filter.skills = { $in: cleaned.skills };
    }
    if (Array.isArray(cleaned.languages) && cleaned.languages.length) {
      filter.languages = { $in: cleaned.languages };
    }
    if (cleaned.ratingCountMin) {
      filter.ratingCount = { $gte: cleaned.ratingCountMin };
    }
    if (cleaned.avgRatingMin) {
      filter.ratingAvg = { $gte: cleaned.avgRatingMin };
    }
    if (cleaned.experienceYearsMin) {
      filter.experienceYears = { $gte: cleaned.experienceYearsMin };
    }
    if (cleaned.minLastActiveWithinDays) {
      const cutoff = new Date(
        Date.now() - cleaned.minLastActiveWithinDays * 24 * 60 * 60 * 1000
      );
      filter.lastActiveAt = { $gte: cutoff };
    }
    if (cleaned.location) {
      if (!cleaned.minDistanceKm == null && !cleaned.maxDistanceKm == null) {
        const DEFAULT_RADIUS = 10; // km
        filter.location = {
          $near: {
            $geometry: cleaned.location,
            $maxDistance: DEFAULT_RADIUS * 1000, // m
          },
        };
      } else {
        const geoQuery = { $geometry: cleaned.location };
        if (cleaned.minDistanceKm != null) {
          geoQuery.$minDistance = cleaned.minDistanceKm * 1000;
        }
        if (cleaned.maxDistanceKm != null) {
          geoQuery.$maxDistance = cleaned.maxDistanceKm * 1000;
        }
        filter.location = { $near: geoQuery };
      }
    }

    const parseSort = (s) => {
      return (s || '')
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

    let sortStr = typeof cleaned.sort === 'string' ? cleaned.sort : '';
    if (!sortStr || (!sortStr.trim() && cleaned.recent === true)) {
      sortStr = '-createdAt';
    }
    const sort = parseSort(sortStr || '-createdAt');
    const fields = cleaned.fields
      ? cleaned.fields
          .split(',')
          .map((w) => w.trim())
          .filter(Boolean)
          .join(' ')
      : 'fullName address category skills experienceYears avatarUrl';

    const page = cleaned.page ?? 1;
    const limit = cleaned.limit ?? 5;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WorkerProfile.find(filter)
        .select(`-location -bio ${fields}`)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      WorkerProfile.countDocuments(filter),
    ]);

    if (items.length === 0) {
      return res.status(200).json({ message: 'Worker fetched successfully' });
    }
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      message: 'Worker fetched successfully',
      workers: items,
      total: total,
      page: page,
      limit: limit,
      skip: skip,
      totalPages: totalPages,
    });
  } catch (e) {
    return next(e);
  }
};
