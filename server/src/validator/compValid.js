// Zod schema
import { z } from 'zod';

// Pagination and sorting
const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export const complaintZod = z.object({
  targetUserId: z.string(), // or appropriate ObjectId check utility
  reqUserId: z.string(),
  note: z.string().max(500),
  proofs: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.enum(['photo', 'video']),
        meta: z.object({
          width: z.number().optional(),
          height: z.number().optional(),
          durationSec: z.number().max(360).optional(),
          mime: z.string().optional(),
          size: z.number().optional(),
        }),
      })
    )
    .optional(),
  // status and adminComments can use defaults
});

export const filterComplaintZod = z.object({
  status: z.enum(['open', 'resolved', 'rejected']).optional(),
  ...pagination.shape,
})