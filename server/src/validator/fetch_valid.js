import { z } from 'zod';
import { jobCategories } from '../common/categories.js';
import { geoPointSchema } from '../common/geoPoint.js';

// Optional simple arrays
const lcString = z
  .string()
  .trim()
  .min(3, { message: 'String must be at least 3 characters' })
  .transform((s) => s.toLowerCase());
const strArrLc = z.array(lcString);

// const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Pagination and sorting
const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(10).default(6),
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
    // Include pagination/sort after filters
    ...pagination.shape,
  })
  .superRefine((d, ctx) => {
    //  categories
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

    // skills
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

    // distance
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
  })
  .strict();

// for filtering job.......
export const jobFilterSchema = base
  .extend({
    status: z
      .enum(['Open', 'Closed', 'InProcess', 'Completed', 'Canceled'])
      .optional(),
    budgetMin: z.coerce.number().min(0).optional(),
    budgetMax: z.coerce.number().min(0).optional(),
    payType: z.coerce
      .string()
      .transform((s) => s.trim().toLowerCase())
      .pipe(z.enum(['hourly', 'weekly', 'monthly']))
      .optional(),
    city: z.string().trim().lowercase().optional(),
    state: z.string().trim().lowercase().optional(),
    recent: z.coerce.boolean().default(false),
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
  })
  .strict();

// for filtering worker......
export const workerFilterSchema = base
  .extend({
    languages: strArrLc.optional(),
    openForWork: z.coerce.boolean().optional(),
    experienceYearsMin: z.coerce.number().int().min(0).optional(),
    avgRatingMin: z.coerce.number().min(0).max(5).optional(),
    ratingCountMin: z.coerce.number().int().min(0).optional(), // make it default 5 after app growth..
    minLastActiveWithinDays: z.coerce.number().int().min(1).max(365).optional(),
  })
  .strict();

export const employerFilterSchema = z
  .object({
    fullName: lcString.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(10).default(5),
    sort: z.enum(['-createdAt', 'createdAt']).default('-createdAt'),
  })
  .superRefine((data, ctx) => {
    const hasId = data.employerId;
    const hasName = data.fullName;
    if (Boolean(hasId) === Boolean(hasName)) {
      // either both present or both absent
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide exactly one of employerId or fullName',
        path: ['employerId'], // you can also point to ['fullName'] or both
      });
    }
  })
  .strict();
