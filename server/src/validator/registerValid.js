import { z } from 'zod';
import { jobCategories } from '../../config/categoriesConfig.js';

const categoryItem = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { message: 'Category cannot be empty or spaces' });
  
const validCategories = new Set(jobCategories.map((c) => c.name.toLowerCase()));
const categoryToSubs = new Map(
  jobCategories.map((c) => [
    c.name.toLowerCase(),
    new Set(c.subcategories.map((s) => s.toLowerCase())),
  ])
);

const emailStr = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: 'Invalid email' });

const passwordStr = z.string().min(8, 'Password must be at least 8 chars');

export const geoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // lng
    z.number().min(-90).max(90), // lat
  ]),
});

export const registerEmployerSchema = z.object({
  email: emailStr,
  password: passwordStr,
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(3, 'Full name must be at least 3 characters'),
  address: z.string().trim().min(1, 'Area cannot be empty').optional(),
  location: geoPointSchema.optional(),
  role: z.literal('Employer', 'Please select Employer as role'),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});

export const registerWorkerSchema = z
  .object({
    email: emailStr,
    password: passwordStr,
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(3, 'Full name must be at least 3 characters'),
    address: z.string().trim().min(1, 'Area cannot be empty').optional(),
    location: geoPointSchema.optional(),
    category: z
      .array(categoryItem)
      .nonempty({ message: 'At least one category is required' })
      .max(5),
    skills: z.array(z.string().trim().toLowerCase()).max(20).optional(),
    experienceYears: z.coerce.number().int().min(0).optional(),
    role: z.literal('Worker', 'Please select Worker as role'),
    otp: z.string().length(6, 'OTP must be 6 digits').optional(),
  })
  .superRefine((data, ctx) => {
    const categories = (data.category ?? [])
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);
    const catDupes = new Set(categories);

    // Category duplicates (case-insensitive)
    if (catDupes.size !== categories.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: 'Duplicate categories not allowed',
      });
    }

    // Category validity
    for (const c of categories) {
      if (!validCategories.has(c)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['category'],
          message: `Category ${c} is not valid`,
        });
      }
    }

    // 2) Normalize skills properly
    const skills = (data.skills ?? [])
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const skillDupes = new Set(skills);

    // Skills duplicates
    if (skillDupes.size !== skills.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['skills'],
        message: 'Duplicate skills not allowed',
      });
    }

    // 3) Build allowed sub-skills from selected categories
    const allowed = new Set();
    for (const c of categories) {
      const subs = categoryToSubs.get(c);
      if (subs) for (const s of subs) allowed.add(s);
    }

    // 4) Validate each skill against allowed
    for (const s of skills) {
      if (!allowed.has(s)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['skills'],
          message: `Skill ${s} is not valid for selected categories`,
        });
      }
    }
  })
  .strict();
