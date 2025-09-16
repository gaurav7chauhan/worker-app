import { z } from 'zod';
import { jobCategories } from '../../config/categoriesConfig.js';

// const normalized = z.string().transform(s => s.trim().toLowerCase())
// const emailSchema = normalized.pipe(z.string().email({ message: 'Invalid email' }))

const skills = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
  z.enum(jobCategories, {
    errorMap: () => ({ message: 'Please select from dropdown.' }),
  })
);

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
  area: z.string().trim().min(1, 'Area cannot be empty').optional(),
  role: z.literal('Employer', 'Please select Employer as role'),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});

export const registerWorkerSchema = z.object({
  email: emailStr,
  password: passwordStr,
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(3, 'Full name must be at least 3 characters'),
  area: z.string().trim().min(1, 'Area cannot be empty').optional(),
  skills: z.array(skills).nonempty(1, 'Add at least one skill'),
  experienceYears: z.coerce.number().int().min(0).optional(),
  role: z.literal('Worker', 'Please select Worker as role'),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});
