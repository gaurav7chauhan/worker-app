import { z } from 'zod';

export const userRegistrationSchema = z.object({
  fullName: z
    .string({ required_error: 'Name is required for your account' })
    .min(2, { message: 'Name must be at least 2 characters long' }),

  email: z.email({ message: 'Enter a valid email address' }),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[0-9]/, { message: 'Password must have at least one number' }),

  userType: z.enum(['worker', 'employer']).optional(),

  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters' })
    .optional(),

  agreeTerms: z.boolean({ required_error: 'You must agree to the terms' }).optional(),

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
  email: z.email({ message: 'Enter a valid email address' }).optional(),

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
  fullName: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .optional(),

  userType: z.enum(['worker', 'employer']).optional(),

  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters' })
    .optional(),

  experience: z
    .number()
    .min(0, { message: 'Experience cannot be negative' })
    .max(50, { message: 'Experience seems too high' })
    .optional(),

  skills: z.array(z.string()).optional(),

  preferredCategory: z
    .enum([
      'Household Work',
      'Security Guard',
      'Retail & Store',
      'Construction & Skilled Labor',
      'General Manual Labor',
    ])
    .optional(),

  education: z
    .enum(['10th Pass', '12th Pass', 'Intermediate', 'College'])
    .optional(),

  languages: z.enum(['English', 'Hindi']).optional(),

  availability: z.enum(['Full-time', 'Part-time', 'Shifts']).optional(),

  phone: z
    .string()
    .regex(/^\+?\d{10,15}$/, {
      message: 'Phone must be 10-15 digits (with optional +91)',
    })
    .optional(),

  summary: z
    .string()
    .max(300, { message: 'Summary cannot exceed 300 characters' })
    .optional(),
});
