import { EmployerProfile } from '../../models/employerModel';
import { employerFilterSchema } from '../../validator/fetchValid.js';

export const listEmployers = async (req, res, next) => {
  try {
    const parsed = employerFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new AppError(first?.message || 'Invalid input data.', {
        status: 422,
      });
    }

    const data = parsed.data;

    const filter = {};
    if (data.fullName) {
      const escaped = data.fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.fullName = new RegExp(`^${escaped}`); // starts-with, case-insensitive - 'i'
    }

    const sort =
      data.sort === '-createdAt' ? { createdAt: -1 } : { createdAt: 1 };

    const page = data.page ?? 1;
    const limit = data.limit ?? 5;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      EmployerProfile.find(filter)
        .select('-location')
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean(),
      EmployerProfile.countDocuments(filter),
    ]);
    if (items.length === 0) {
      return res
        .status(200)
        .json({ message: `There is no matching Employer's for you.` });
    }

    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      message: 'Employers fetched successfully',
      Employers: items,
      total,
      page,
      limit,
      skip,
      totalPages,
    });
  } catch (e) {
    return next(e);
  }
};
