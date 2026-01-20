import { z } from 'zod';
import { jobCategories } from '../common/categories.js';
import { geoPointSchema } from '../common/geoPoint.js';

const statusType = ['Open', 'Closed', 'Canceled', 'Completed'];

const AddressSchema = z.object({
  line1: z.string().trim().max(150).optional(),
  city: z.string().trim().max(100).optional(),
  neighbourhood: z.string().trim().max(100).optional(),
});

const validCategories = new Set(jobCategories.map((c) => c.name.toLowerCase()));

const categoryToSubs = new Map(
  jobCategories.map((c) => [
    c.name.toLowerCase(),
    new Set(c.subcategories.map((s) => s.toLowerCase())),
  ])
);

const EmployerAssetSchema = z.object({
  url: z.string().url(),
  caption: z.string().trim().max(200).optional(),
});

export const jobPostBodySchema = z
  .object({
    category: z.string().trim().toLowerCase().nonempty(),
    skills: z
      .array(z.string().trim().toLowerCase())
      .max(5, 'Maximum 5 skills allowed')
      .optional(),
    description: z.string().trim().max(5000).optional(),
    budgetAmount: z.coerce.number().positive('Budget must be greater than 0'),
    address: AddressSchema,
    location: geoPointSchema,
    status: z.enum(statusType),
    employerAssets: z
      .array(EmployerAssetSchema)
      .max(5, 'Maximum 5 images allowed')
      .optional(),
  })
  .refine((data) => data.address || data.location, {
    message: 'Either address or location is required',
    path: ['address'],
  })
  .superRefine((data, ctx) => {
    const categories = data.category ? [data.category] : [];

    for (const c of categories) {
      if (!validCategories.has(c)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['category'],
          message: `Category "${c}" is not valid`,
        });
      }
    }

    const skills = data.skills ?? [];
    const allowed = new Set();
    for (const c of categories) {
      const subs = categoryToSubs.get(c);
      if (subs) for (const s of subs) allowed.add(s);
    }

    const skillDupes = new Set(skills);
    if (skillDupes.size !== skills.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['skills'],
        message: 'Duplicate skills not allowed',
      });
    }

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
