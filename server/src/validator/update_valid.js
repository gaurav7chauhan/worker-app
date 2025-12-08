import { z } from 'zod';
import { languages as allowedLangs } from '../../config/languageConfig.js';
import { jobCategories } from '../../config/categoriesConfig.js';

const AddressSchema = z.object({
  line1: z.string().trim().max(120),
  line2: z.string().trim().max(120).optional(),
  line3: z.string().trim().max(120).optional(),
  pincode: z.string().trim().max(10),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
});

const validCategories = new Set(jobCategories.map((e) => e.name.toLowerCase()));
const categoryToSubs = new Map(
  jobCategories.map((e) => [
    e.name.toLowerCase(),
    new Set(e.subcategories.map((s) => s.toLowerCase())),
  ])
);

const baseProfileUpdate = z
  .object({
    fullName: z.string().trim().min(1).max(80).optional(),
    address: AddressSchema.partial().optional(),
    bio: z.string().trim().max(500).optional(),
    avatarUrl: z.string().url().optional(),
    coverUrl: z.string().url().optional(),
    languages: z
      .array(z.string().trim().toLowerCase()) // normalize case first [6]
      .max(5)
      .refine(
        (arr) => arr.every((v) => allowedLangs.includes(v)),
        'Invalid language'
      )
      .refine((arr) => new Set(arr).size === arr.length, {
        message: 'Duplicate languages not allowed',
      })
      .optional(),
  })
  .strict();

export const employerUpdate = baseProfileUpdate;

export const workerUpdate = baseProfileUpdate
  .extend({
    experienceYears: z.coerce.number().int().min(0).max(60).optional(),
    availability: z.enum(['available', 'off-work', 'outside']).optional(),
    skills: z.array(z.string().trim().toLowerCase()).max(20).optional(),
    category: z
      .array(z.string().trim().toLowerCase())
      .nonempty()
      .max(5)
      .optional(),
  })
  .superRefine((data, ctx) => {
    const categories = data.category ?? [];
    const catDupes = new Set(categories);
    if (catDupes.size !== categories.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: 'Duplicate categories not allowed',
      });
    }

    for (const c of categories) {
      if (!validCategories.has(c)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['category'],
          message: `Category ${c} is not valid.`,
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
        path: ['category'],
        message: 'Duplicate categories not allowed',
      });
    }

    for (const s of skills) {
      if (!allowed.has(s)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['category'],
          message: `Skill ${s} is not valid for selected categories`,
        });
      }
    }
  });
