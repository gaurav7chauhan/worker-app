import { AuthUser } from '../models/authUser.js';
import { loginSchema } from '../validator/validate.js';

export const loginUser = async (req, res, next) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.issues[0].message });
  }

  const { email, password } = result.data;

  const foundUser = await AuthUser.findOne({ email });
  if (!foundUser) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await foundUser.isPasswordMatch(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (foundUser.isBlocked) {
    return res.status(409).json({ message: 'You are blocked by admin.' });
  }

  const fromColl =
    foundUser.role === 'Employer' ? 'employerprofiles' : 'workerprofiles';

  const pipeline = [
    { $match: { _id: foundUser._id } },
    {
      $lookup: {
        from: fromColl,
        localField: '_id',
        foreignField: 'userId',
        as: 'profile',
      },
    },
    {
      $unwind: { path: '$profile', preserveNullAndEmptyArrays: false },
    },
    {
      $project: {
        _id: 1,
        email: 1,
        role: 1,
        'profile.fullName': 1,
        'profile.area': 1,
        'profile.skills': 1,
        'profile.experienceYears': 1,
      },
    },
  ];

  const out = await AuthUser.aggregate(pipeline);
  if (!out.length) {
    return res.status(404).json({ message: 'User not found' });
  }
  const user = out[0];
 
  return res.status(200).json({user, message: 'Login successfull'})
};
