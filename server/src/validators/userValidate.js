import { z } from 'zod';

export const userRegistrationSchema = z.object({
  fullName: z.string({ required_error: 'fullName is required' }).min(2, {
    message: 'Name must be at least 2 characters long',
  }),

  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Enter a valid email address' }),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[0-9]/, { message: 'Password must have at least one number' }),

  userType: z.enum(['worker', 'employer']).optional(),

  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters' })
    .optional(),

  otp: z.string().length(4).optional(),
});

export const userLoginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Enter a valid email address' }),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),

  otp: z.string().length(4).optional(),
});

export const userEmailUpdateSchema = z.object({
  email: z.email({ message: 'Enter a valid email address' }),

  password: z.string(),

  otp: z.string().length(4).optional(),
});

export const userPasswordUpdateSchema = z
  .object({
    currentPassword: z.string({
      required_error: 'Current password is required',
    }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, { message: 'New password must be at least 8 characters long' })
      .regex(/[0-9]/, {
        message: 'New password must have at least one number',
      }),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'New password and confirm password must match',
  });

export const userForgotPasswordSchema = z.object({
  email: z.email({ message: 'Enter a valid email address' }),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, { message: 'New password must be at least 8 characters long' })
    .regex(/[0-9]/, { message: 'New password must have at least one number' }),
  otp: z.string().length(4).optional(),
  type: z.literal('forgot_password').optional(),
});

export const userBioSchema = z.object({
  fullName: z.string().min(2).optional(),

  userType: z
    .enum(['worker', 'employer'])
    .optional()
    .refine(
      (val) => val === undefined || ['worker', 'employer'].includes(val),
      {
        message: 'Select a valid user type (worker or employer) or leave blank',
      }
    ),

  location: z.string().min(2).optional(),

  experience: z.number().min(0).max(50).optional(),

  skills: z
    .array(z.string())
    .optional()
    .refine((val) => val?.every((skill) => skill.length > 0), {
      message: 'Skills must be non-empty strings in an array',
    }),

  preferredCategory: z
    .enum([
      'Household Work',
      'Security Guard',
      'Retail & Store',
      'Construction & Skilled Labor',
      'General Manual Labor',
    ])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        [
          'Household Work',
          'Security Guard',
          'Retail & Store',
          'Construction & Skilled Labor',
          'General Manual Labor',
        ].includes(val),
      {
        
        message: 'Select a valid category from the options or leave blank',
      }
    ),

  education: z
    .enum(['10th Pass', '12th Pass', 'Intermediate', 'College'])
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        ['10th Pass', '12th Pass', 'Intermediate', 'College'].includes(val),
      {
        message:
          'Select a valid education level from the options or leave blank',
      }
    ),

  languages: z
    .enum(['English', 'Hindi'])
    .optional()
    .refine((val) => val === undefined || ['English', 'Hindi'].includes(val), {
      message: 'Select a valid language (English or Hindi) or leave blank',
    }),

  availability: z
    .enum(['Full-time', 'Part-time', 'Shifts'])
    .optional()
    .refine(
      (val) =>
        val === undefined || ['Full-time', 'Part-time', 'Shifts'].includes(val),
      {
        message:
          'Select a valid availability type from the options or leave blank',
      }
    ),

  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/)
    .optional(),

  summary: z.string().max(300).optional(),
});
