export const checkBlocked = (req, res, next) => {
  if (req.user.isBlocked) {
    return res
      .status(403)
      .json({ message: 'Access denied: User blocked by admin' });
  }
  next();
};
