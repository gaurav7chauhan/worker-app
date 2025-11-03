import { userValidation } from "../services/userCheck.js";

export const requireActiveUser = async (req, res, next) => {
  try {
    req.authUser = await userValidation(req);
    next();
  } catch (e) {
    return next(e);
  }
};
