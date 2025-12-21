import { userValidation } from "../services/authService.js";

export const requireActiveUser = async (req, res, next) => {
  try {
    req.authUser = await userValidation(req);
    next();
  } catch (e) {
    return next(e);
  }
};
