import { z } from 'zod';
import { jobCategories } from '../common/categories.js';
import { geoPointSchema } from '../common/geoPoint.js';

const statusType = ['Open', 'Closed', 'Canceled', 'Completed'];
const AddressSchema = z.object({
  line1: z.string().trim().max(120),
  line2: z.string().trim().max(120).optional(),
  line3: z.string().trim().max(120).optional(),
  pincode: z.string().trim().max(10),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
});

const HHMM = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM 24h')
  .optional();
const DayPart = z.enum(['morning', 'afternoon', 'evening', 'night']).optional();
const Term = z.enum([
  'one_time',
  'half_day',
  'full_day',
  'full_time',
  '1_week',
  '2_weeks',
  '3_weeks',
  '1_month',
  '2_months',
  '3_months',
]);

const Schedule = z
  .object({
    timeFrom: HHMM,
    timeTo: HHMM,
    dayPart: DayPart,
    term: Term,
  })
  .superRefine((v, ctx) => {
    if (v.timeFrom >= v.timeTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['timeTo'],
        message: 'timeTo must be after timeFrom',
      });
    }
  });

const validCategories = new Set(jobCategories.map((c) => c.name.toLowerCase()));
const categoryToSubs = new Map(
  jobCategories.map((c) => [
    c.name.toLowerCase(),
    new Set(c.subcategories.map((s) => s.toLowerCase())),
  ])
);

export const jobPostBodySchema = z
  .object({
    category: z.array(z.string().trim().toLowerCase()).nonempty().max(5),
    skills: z.array(z.string().trim().toLowerCase()).max(20).optional(),
    description: z.string().trim().max(5000).optional(),
    budgetAmount: z.coerce.number().positive('Budget must be > 0'),
    address: AddressSchema.partial().optional(),
    location: geoPointSchema.optional(),
    schedule: Schedule.optional(),
    status: z.enum(statusType).optional(),
    employerAssets: z
      .array(
        z.object({
          url: z.string().url(),
          type: z.enum(['image']),
          caption: z.string().trim().max(200).optional(),
        })
      )
      .max(5, 'Maximum 5 images allowed')
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
          message: `Category ${c} is not valid`,
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
