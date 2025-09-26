import { z } from 'zod';

export const applicationCreate = z
  .object({
    jobId: z.string().trim().min(1, 'jobId is required'),
    coverNote: z.string().trim().max(200).optional(),
    expectedRate: z.coerce
      .number()
      .positive('Expected rate must be > 0')
      .optional(),
  })
  .strict();
