import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const roleEnum = z.enum(['Employer', 'Worker']);

const scoreSchema = z.number().int().min(1).max(5);

const tagSchema = z.string().trim().min(1).max(30);

export const rateBodySchema = z.object({
  targetUser: objectId,
  jobId: objectId,
  targetRole: roleEnum,
  score: scoreSchema,
  tags: z.array(tagSchema).max(10).optional().default([]),
  comment: z.string().trim().max(500).optional().default(''),
});
