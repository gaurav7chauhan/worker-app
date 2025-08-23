export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }
    
    const getUser = req.user;

    const userObj = getUser.toObject();
    console.log(userObj);
    delete userObj.password;
    delete userObj.isBlocked;

    return res.status(200).json({
      message: 'User profile fetched successfully',
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err?.message || 'Internal server error' });
  }
};
