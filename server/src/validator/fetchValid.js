import { z } from 'zod';
import { jobCategories } from '../../config/categoriesConfig.js';
import { pointSchema } from '../common/geoPoint.js';

// Helpers
const objectId = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId')
  .optional(); // 24-hex string id

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

// Extras
const experienceYears = z.coerce.number().enum([1, 2, 3, 4, 5]);
const ratingNumber = z.coerce.number().min(0).max(5).optional();
const payTypeEnum = z.enum(['Fixed', 'Hourly']).optional();
const shiftEnum = z
  .enum(['morning', 'afternoon', 'evening', 'night'])
  .optional();

// Final filter schema
const base = z
  .object({
    // Who/what to match
    category: strArrLc.optional(),
    skills: strArrLc.optional(),
    location: pointSchema.optional(),
    minDistanceKm: z.coerce.number().min(0).optional(),
    maxDistanceKm: z.coerce.number().positive().optional(),
    avgRatingMin: z.coerce.number().min(0).max(5).optional(),
    avgRatingMax: z.coerce.number().min(0).max(5).optional(),
    ratingCountMin: z.coerce.number().int().min(0).optional(), // make it default 5 after growth..
    // Include pagination/sort after filters
    ...pagination.shape,
  })
  .superRefine((d, ctx) => {
    if ((d.minDistanceKm != null || d.maxDistanceKm != null) && !d.location) {
      ctx.addIssue({
        code: 'custom',
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
        code: 'custom',
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
        code: 'custom',
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
        code: 'custom',
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
        code: 'custom',
        path: ['experienceYearsMin'],
        message: 'experienceYearsMin must be <= experienceYearsMax',
      });
    }
  });
