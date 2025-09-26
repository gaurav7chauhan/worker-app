export const workerApply = async (req, res, next) => {
  try {
    if (!req.auth?._id) {
      throw new AppError('Authentication required', { status: 401 });
    }

    
  } catch (error) {
    return next(error);
  }
};
