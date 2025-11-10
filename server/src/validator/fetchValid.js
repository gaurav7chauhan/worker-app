import { z } from 'zod';
import { jobCategories } from '../../config/categoriesConfig.js';
import { geoPointSchema } from '../common/geoPoint.js';

// Helpers
// Optional simple arrays
const lcString = z
  .string()
  .trim()
  .min(1)
  .transform((s) => s.toLowerCase());
const strArrLc = z.array(lcString);

// Pagination and sorting
const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().default('-createdAt'), // e.g., "-createdAt,name"
  fields: z.string().trim().optional(), // projection: "title,category,budgetAmount"
});

const validCategories = new Set(
  jobCategories.map((c) => c.name.toLocaleLowerCase())
);
const subcategories = new Map(
  jobCategories.map((c) => [
    c.name.toLowerCase(),
    new Set(c.subcategories.map((s) => s.toLowerCase())),
  ])
);

// Final filter schema
const base = z
  .object({
    // Who/what to match
    category: strArrLc.optional(),
    skills: strArrLc.optional(),
    location: geoPointSchema.optional(),
    minDistanceKm: z.coerce.number().min(0).optional(),
    maxDistanceKm: z.coerce.number().positive().optional(),
    avgRatingMin: z.coerce.number().min(0).max(5).optional(),
    avgRatingMax: z.coerce.number().min(0).max(5).optional(),
    ratingCountMin: z.coerce.number().int().min(0).optional(), // make it default 5 after app growth..
    // Include pagination/sort after filters
    ...pagination.shape,
  })
  .superRefine((d, ctx) => {
    const categories = d.category ?? [];
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
          message: `Category ${c} is not valid`,
        });
      }
    }

    const skills = d.skills ?? [];
    const skillDupes = new Set(skills);
    const allowed = new Set();
    if (skillDupes.size !== skills.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['skills'],
        message: 'Duplicate skills not allowed',
      });
    }
    for (const c of categories) {
      const subs = subcategories.get(c);
      if (subs) for (const s of subs) allowed.add(s);
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

    if ((d.minDistanceKm != null || d.maxDistanceKm != null) && !d.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['location'],
        message: 'location is required when using distance filters',
      });
    }
    if (
      d.minDistanceKm != null &&
      d.maxDistanceKm != null &&
      d.minDistanceKm > d.maxDistanceKm
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minDistanceKm'],
        message: 'minDistanceKm must be <= maxDistanceKm',
      });
    }
    if (
      d.minDistanceKm != null &&
      d.maxDistanceKm != null &&
      d.minDistanceKm > d.maxDistanceKm
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minDistanceKm'],
        message: 'minDistanceKm must be <= maxDistanceKm',
      });
    }
    if (
      d.avgRatingMin != null &&
      d.avgRatingMax != null &&
      d.avgRatingMin > d.avgRatingMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['avgRatingMin'],
        message: 'avgRatingMin must be <= avgRatingMax',
      });
    }
  })
  .strict();

// for filtering job.......
export const jobFilterSchema = base
  .extend({
    status: z.enum(['Open', 'Closed', 'Completed', 'Canceled']).optional(),
    budgetMin: z.coerce.number().min(0).optional(),
    budgetMax: z.coerce.number().min(0).optional(),
    payType: z.enum(['Fixed', 'Hourly']).optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    createdWithinDays: z.coerce.number().int().min(1).max(365).optional(),
  })
  .superRefine((d, ctx) => {
    if (
      d.budgetMin != null &&
      d.budgetMax != null &&
      d.budgetMin > d.budgetMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['budgetMin'],
        message: 'budgetMin must be <= budgetMax',
      });
    }
  });

// for filtering worker......
export const workerFilterSchema = base
  .extend({
    openForWork: z.coerce.boolean().optional(),
    experienceYearsMin: z.coerce.number().int().min(0).optional(),
    experienceYearsMax: z.coerce.number().int().min(0).optional(),
    languages: strArrLc.optional(),
    lastActiveWithinDays: z.coerce.number().int().min(1).max(365).optional(),
  })
  .superRefine((d, ctx) => {
    if (
      d.experienceYearsMin != null &&
      d.experienceYearsMax != null &&
      d.experienceYearsMin > d.experienceYearsMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['experienceYearsMin'],
        message: 'experienceYearsMin must be <= experienceYearsMax',
      });
    }
  });
