import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { AppError } from '../../utils/apiError.js';
import { jobFilterSchema } from '../../validator/fetchValid.js';

export const filterJobs = async (req, res, next) => {
  try {
    const { _id, role } = req.authUser;

    const parseData = jobFilterSchema.safeParse(req.body);
    

  } catch (e) {
    return next(e);
  }
};
