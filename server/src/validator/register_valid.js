import { z } from 'zod';

const emailStr = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: 'Invalid email' });

const passwordStr = z.string().min(8, 'Password must be at least 8 chars');

export const registerEmployerSchema = z.object({
  email: emailStr,
  password: passwordStr,
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(3, 'Full name must be at least 3 characters'),
  role: z
    .string()
    .transform((v) => v.toLowerCase())
    .refine((v) => v === 'employer', {
      message: 'Invalid role selected',
    }),
});

export const registerWorkerSchema = z
  .object({
    email: emailStr,
    password: passwordStr,
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(3, 'Full name must be at least 3 characters'),

    role: z
      .string()
      .transform((v) => v.toLowerCase())
      .refine((v) => v === 'worker', {
        message: 'Invalid role selected',
      }),
  })
  .strict();
