import { z } from 'zod';

const emailStr = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: 'Invalid email' });

const passwordStr = z.string().min(8, 'Password must be at least 8 chars');

export const loginSchema = z.object({
  email: emailStr,
  password: passwordStr,
});
