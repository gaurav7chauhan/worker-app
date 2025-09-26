import { z } from 'zod';
import { jobCategories } from '../../config/categoriesConfig.js';

const statusType = [
  'Open',
  'Assigned',
  'InProgress',
  'SubmittedByWorker',
  'Completed',
  'Canceled',
];
const AddressSchema = z.object({
  line1: z.string().trim().max(120),
  line2: z.string().trim().max(120).optional(),
  line3: z.string().trim().max(120).optional(),
  pincode: z.string().trim().max(10),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
});
const validCategories = new Set(jobCategories.map((c) => c.name.toLowerCase()));
const categoryToSubs = new Map(
  jobCategories.map((c) => [
    c.name.toLowerCase(),
    new Set(c.subcategories.map((s) => s.toLowerCase())),
  ])
);

export const jobPostBodyUser = z
  .object({
    category: z
      .array(z.string().trim().toLowerCase())
      .nonempty()
      .max(5),
    skills: z.array(z.string().trim().toLowerCase()).max(20).optional(),
    description: z.string().trim().max(5000).optional(),
    budgetAmount: z.coerce.number().positive('Budget must be > 0'),
    location: AddressSchema.partial().optional(),
    schedule: z.string().trim().min(2),
    status: z.enum(statusType).optional(),
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
  }).strict();


  // Term options
// const termOptions = [
//   'one_time',
//   '1_week','2_weeks','3_weeks',
//   '1_month','2_months','3_months',
// ];
// const Term = z.enum(termOptions);

// // Schedule object to replace plain string
// const Schedule = z.object({
//   timeFrom: HHMM,
//   timeTo: HHMM,
//   term: Term,
// }).superRefine((v, ctx) => {
//   if (v.timeFrom >= v.timeTo) {
//     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['timeTo'], message: 'timeTo must be after timeFrom' });
//   }
// });