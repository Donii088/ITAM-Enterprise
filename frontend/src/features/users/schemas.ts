import { z } from 'zod';
import { passwordSchema } from '@/lib/validation';
import { ROLE } from '@/types';

export const createUserSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(100, 'Maximum 100 characters'),
    lastName: z.string().trim().min(1, 'Last name is required').max(100, 'Maximum 100 characters'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(256),
    jobTitle: z.string().trim().min(1, 'Job title is required').max(150, 'Maximum 150 characters'),
    role: z.enum([ROLE.Employee, ROLE.ItAdmin], { errorMap: () => ({ message: 'Select a role' }) }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

const baseUpdateUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100, 'Maximum 100 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').max(100, 'Maximum 100 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(256),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(150, 'Maximum 150 characters'),
  role: z.enum([ROLE.Employee, ROLE.ItAdmin], { errorMap: () => ({ message: 'Select a role' }) }),
  // Both blank: keep the current password. Both filled and matching: reset it.
  newPassword: z.union([passwordSchema, z.literal('')]).optional(),
  confirmPassword: z.string().optional(),
});

export const updateUserSchema = baseUpdateUserSchema
  .refine((data) => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
