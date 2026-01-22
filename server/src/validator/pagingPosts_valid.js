import { z } from 'zod';

export const pagination = z.object({
  sort: z.enum(['latest', 'oldest']).default('latest'),

  limit: z.coerce.number().int().min(1).max(10).default(6),

  onlyLatest: z.coerce.boolean().default(false),

  page: z.coerce.number().int().min(1).default(1),
});
