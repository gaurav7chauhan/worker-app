// Zod schema
import { z } from 'zod';

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
