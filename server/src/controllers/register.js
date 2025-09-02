import mongoose from 'mongoose';
import { EmployerProfile } from '../models/user';
import { registerEmployerSchema } from '../validator/validate';
import { AuthUser } from '../models/AuthUser';

export const register = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const result = registerEmployerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const { email, password, role, fullName, area } = result.data;

    await session.withTransaction(async () => {
      const exists = await AuthUser.exists({ email }).session(session);

      if (exists) {
        throw Object.assign(new Error('User already exists'), { status: 409 });
      }

      // Create AuthUser
      const user = await AuthUser.create(
        { email, password, role: 'Employer' },
        {
          session,
        }
      );

      const userId = user._id;

      // Create EmployerProfile
      await EmployerProfile.create(
        {
          userId,
          fullName,
          area,
        },
        { session }
      );
    });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    const code = error?.status || 400;
    return res
      .status(code)
      .json({ message: error.message || 'Invalid request payload' });
  } finally {
    await session.endSession();
  }
};
