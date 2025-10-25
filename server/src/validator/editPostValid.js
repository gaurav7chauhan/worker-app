import { jobPostBodySchema } from './postValid.js';

const validCategories = new Set(jobCategories.map((c) => c.name.toLowerCase()));
const categoryToSubs = new Map(
  jobCategories.map((c) => [
    c.name.toLowerCase(),
    new Set(c.subcategories.map((s) => s.toLowerCase())),
  ])
);

export const editPostBodySchema = jobPostBodySchema
  .partial()
  .superRefine((v, ctx) => {
    const from = v.schedule.timeFrom;
    const to = v.schedule.timeTo;
    if (from && to && from >= to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['schedule'],
        message: 'timeTo must be after timeFrom',
      });
    }
    if (v.category) {
      const dup = new Set(v.category);
      if (dup.size !== v.category.length) {
        ctx.addIssue({
          code: 'custom',
          path: ['category'],
          message: 'Duplicate categories not allowed',
        });
      }

      for (const c of v.category) {
        if (!validCategories.has(c)) {
          ctx.addIssue({
            code: 'custom',
            path: ['category'],
            message: `Category ${c} is not valid`,
          });
        }
      }
      if (v.skills) {
        const dup = new Set(v.skills);
        if (dup.size !== v.skills.length) {
          ctx.addIssue({
            code: 'custom',
            path: ['skills'],
            message: 'Duplicate skills not allowed',
          });
        }
      }

      if (v.category) {
        const allowed = new Set();
        for (const c of v.category) {
          const subs = categoryToSubs.get(c);
          if (subs) subs.forEach((s) => allowed.add(s));
        }
      }

      for (const s of v.skills) {
        if (!allowed.has(s)) {
          ctx.addIssue({
            code: 'custom',
            path: ['skills'],
            message: `Skill ${s} is not valid for selected categories`,
          });
        }
      }
    }
  });
