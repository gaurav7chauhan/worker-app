import { AuthUser } from '../../models/authModel.js';
import { EmployerProfile } from '../../models/employerModel.js';
import { AppError } from '../../utils/apiError.js';

export const filterJobs = async (req, res, next) => {
  try {
    const { _id, role } = req.authUser;

    

  } catch (e) {
    return next(e);
  }
};
