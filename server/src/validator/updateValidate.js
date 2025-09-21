import { z } from 'zod';
import { languages as allowedLangs } from '../../config/languageConfig.js';
import { jobCategories } from '../../config/categoriesConfig.js';

const AddressSchema = z.object({
  line1: z.string().trim().max(120),
  line2: z.string().trim().max(120).optional(),
  line3: z.string().trim().max(120).optional(),
  pincode: z.string().trim().max(10),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
});

const baseProfileUpdate = z
  .object({
    fullName: z.string().trim().min(1).max(80).optional(),
    address: AddressSchema.partial().optional(),
    bio: z.string().trim().max(500).optional(),
    avatarUrl: z.string().url().optional(),
    coverUrl: z.string().url().optional(),
    languages: z
      .array(z.string().trim().toLowerCase()) // normalize case first [6]
      .max(5)
      .refine(
        (arr) => arr.every((v) => allowedLangs.includes(v)),
        'Invalid language'
      )
      .refine((arr) => new Set(arr).size === arr.length, {
        message: 'Duplicate languages not allowed',
      })
      .optional(),
  })
  .strict();

const skillsSchema = z
  .array(z.string().trim().toLowerCase())
  .max(20)
  .refine((arr) => arr.every((v) => jobCategories.includes(v)), {
    message: 'Invalid skill',
  })
  .refine((arr) => new Set(arr).size === arr.length, {
    message: 'Duplicate skills not allowed',
  });

export const workerUpdate = baseProfileUpdate.extend({
  skills: skillsSchema.optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  availability: z.enum(['available', 'off-work', 'outside']).optional(),
});

export const employerUpdate = baseProfileUpdate;
