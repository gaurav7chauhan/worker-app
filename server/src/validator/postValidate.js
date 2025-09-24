import { z } from 'zod';
import { jobCategories } from '../../config/categoriesConfig.js';

const categorySet = new Set(jobCategories);
export const jobPostBody = z.object({
  title: z.string().trim().min(3, 'Title too short'),
  description: z.string().trim().max(5000).optional(),
  category: z.string().refine((c) => categorySet.has(c), {
    message: 'Invalid category',
  }),
  skills: z
    .union([
      z
        .array(z.string().trim().toLowerCase())
        .nonempty('At least one skill required')
        .max(20, 'Too many skills')
        .refine((arr) => new Set(arr).size === arr.length, {
          message: 'Duplicate skills not allowed',
        }),
      z.string().trim().toLowerCase(),
    ])
    .optional(),
  budgetAmount: z.number().positive('Budget must be > 0'),
  budgetCurrency: z.string().length(3, 'Use ISO currency code'),
  location: z.string().trim().min(2),
  schedule: z.string().trim().min(2),
  status: z
    .enum([
      'Open',
      'Assigned',
      'InProgress',
      'SubmittedByWorker',
      'Completed',
      'Canceled',
    ])
    .optional(),
  employerAssets: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.enum(['photo', 'video']),
        meta: z
          .object({
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
            durationSec: z.number().positive().max(10).optional(), // your policy
            mime: z.string().optional(),
            size: z.number().int().positive().optional(),
          })
          .optional(),
      })
    )
    .max(6)
    .optional(),
});
