import { z } from 'zod';
const emailStr = z
  .string()
  .trim()
  .pipe(z.string().email({ message: 'Invalid email' }))
  .toLowerCase();

const passwordStr = z.string().min(8, 'Password must be at least 8 chars');

export const loginSchema = z.object({
  body: z.object({
    email: emailStr,
    password: passwordStr,
  }),
});

export const registerEmployerSchema = z.object({
  body: z.object({
    email: emailStr,
    password: passwordStr,
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(3, 'Full name must be at least 3 characters'),
    area: z.string().trim().min(1, 'Area cannot be empty').optional(),
    role: z.literal('Employer'),
    otp: z.string().length(6, 'OTP must be 6 digits').optional(),
  }),
});

export const registerWorkerSchema = z.object({
  body: z.object({
    email: emailStr,
    password: passwordStr,
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(3, 'Full name must be at least 3 characters'),
    area: z.string().trim().min(1, 'Area cannot be empty').optional(),
    skills: z.array(z.string()).min(1, 'Add at least one skill'),
    experienceYears: z.coerce.number().int().min(0).optional(),
    role: z.literal('Worker'),
    otp: z.string().length(6, 'OTP must be 6 digits').optional(),
  }),
});
