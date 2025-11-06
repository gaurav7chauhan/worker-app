import { z } from 'zod';
import { jobCategories } from '../../config/categoriesConfig.js';
import { pointSchema } from '../common/geoPoint.js';

// Helpers
const objectId = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId')
  .optional(); // 24-hex string id

const statusEnum = z
  .enum(['Open', 'Closed', 'Completed', 'Canceled'])
  .optional();

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
const ratingNumber = z.coerce.number().min(0).max(5).optional();
const payTypeEnum = z.enum(['Fixed', 'Hourly', 'Weekly']).optional();
const shiftEnum = z
  .enum(['morning', 'afternoon', 'evening', 'night'])
  .optional();

// Final filter schema
export const jobFilterSchema = z
  .object({
    // Who/what to match
    fullName: z.string().trim().min(1).optional(), // text search on poster/worker name
    employerId: objectId, // filter by employer
    assignedWorkerId: objectId, // filter by assigned worker

    // Attributes
    category: strArrLc.optional(),
    skills: strArrLc.optional(),
    status: statusEnum,

    // Budget range (use min/max for querying)
    budgetMin: z.coerce.number().min(0).optional(),
    budgetMax: z.coerce.number().min(0).optional(),

    // Optional city/state level filters if you expose them; omit full address/point geometry for simple filters
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),

    // Ratings
    avgRatingsMin: ratingNumber,
    avgRatingsMax: ratingNumber,

    // Compensation
    payType: payTypeEnum,
    experienceYears: z.enum(z.coerce.number([1, 2, 3, 4, 5])),
    shift: shiftEnum,

    // nearest job
    location: pointSchema.optional(),

    // Include pagination/sort after filters
    ...pagination.shape,
  })
  .superRefine((data, ctx) => {
    // for min max budget....
    if (data.budgetMax && data.budgetMin && data.budgetMax < data.budgetMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['budgetMin'],
        message: 'budgetMin must be <= budgetMax',
      });
    }

    // checking presence....
    const categories = data.category ?? [];
    const catDupes = new Set(categories);

    if (categories.length !== catDupes.size) {
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

    const skills = data.skills ?? [];
    const allowed = new Set();

    for (const c of categories) {
      const subs = subcategories.get(c);
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
