import { z } from 'zod';
import { jobCategories } from '../common/categories.js';
import { geoPointSchema } from '../common/geoPoint.js';

const statusType = ['Open', 'Closed', 'Canceled', 'Completed'];

const AddressSchema = z.object({
  line1: z.string().trim().max(150).optional(),
  city: z.string().trim().max(100).optional(),
  neighbourhood: z.string().trim().max(100).optional(),
});

const validCategories = new Set(jobCategories.map((e) => e.name.toLowerCase()));

const categoryToSubs = new Map(
  jobCategories.map((e) => [
    e.name.toLowerCase(),
    new Set(e.subcategories.map((s) => s.toLowerCase())),
  ])
);

const EmployerAssetSchema = z.object({
  url: z.string().url(),
  caption: z.string().trim().max(200).optional(),
});

export const updatePostSchema = z
  .object({
    category: z.string().trim().toLowerCase().optional(),
    skills: z
      .array(z.string().trim().toLowerCase())
      .min(0)
      .max(5, 'Maximum 5 skills allowed')
      .optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    budgetAmount: z.coerce
      .number()
      .positive('Budget must be greater than 0')
      .nullable()
      .optional(),
    address: AddressSchema.partial().nullable().optional(),
    location: geoPointSchema.nullable().optional(),
    employerAssets: z
      .array(EmployerAssetSchema)
      .max(5, 'Maximum 5 images allowed')
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    let category;
    if (data.category) {
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

      let skills;
      if (data.skills) {
        skills = data.skills ?? [];
        const allowed = new Set();

        for (const c of categories) {
          const subs = categoryToSubs.get(c);
          if (subs) for (const s of subs) allowed.add(s);
        }

        if (new Set(skills).size !== skills.length) {
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
      }
    }
  });
