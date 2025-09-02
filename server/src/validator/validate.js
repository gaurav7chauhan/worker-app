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
    fullName: z.string().trim().min(3, 'Name must be minimum 3 character'),
    area: z.string().trim().optional(),
    role: z.literal('Employer'),
  }),
});

export const registerWorkerSchema = z.object({
  body: z.object({
    email: emailStr,
    password: passwordStr,
    fullName: z.string().trim().min(3, 'Name must be minimum 3 character'),
    area: z.string().trim().optional(),
    skills: z.array(z.string()).min(1, 'At least 1 skill'),
    experienceYears: z.coerce.number().int().min(0).optional(),
    role: z.literal('Worker'),
  }),
});
