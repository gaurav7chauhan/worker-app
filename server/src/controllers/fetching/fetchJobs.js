import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
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

    const filter = {
      ...cleaned,
    };

    if (cleaned.location) {
      if (!cleaned.minDistanceKm && !cleaned.maxDistanceKm) {
        const DEFAULT_RADIUS = 10; // in kilometers
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
  } catch (e) {
    return next(e);
  }
};
