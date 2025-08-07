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

  userType: z.enum(['worker', 'employer'], {}).optional(),

  phone: z
    .string()
    .optional()
    .regex(/^\+?\d{10,15}$/, {
      message: 'Phone must be 10-12 digits (with optional +91)',
    }),

  location: z
    .string()
    .optional()
    .min(2, { message: 'Location must be at least 2 characters' }),

  agreeTerms: z.boolean({ required_error: 'You must agree to the terms' }),

  otp: z.string().length(4).optional(),

  type: z.literal('register'),
});

export const userLoginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Enter a valid email address' }),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),

  otp: z.string().length(4).optional(),

  type: z.literal('login').optional(),
});

export const userUpdateSchema = z.object({
  fullName: z
    .string({ required_error: 'Name is required for your account' })
    .min(2, { message: 'Name must be at least 2 characters long' })
    .optional(),

  email: z.email({ message: 'Enter a valid email address' }).optional(),

  phone: z
    .string()
    .optional()
    .regex(/^\+?\d{10,15}$/, {
      message: 'Phone must be 10-12 digits (with optional +91)',
    }),

  location: z
    .string()
    .optional()
    .min(2, { message: 'Location must be at least 2 characters' }),
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
