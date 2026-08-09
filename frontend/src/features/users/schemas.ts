import { z } from 'zod';
import { ROLE } from '@/types';

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100, 'Maximum 100 characters'),
  lastName: z.string().trim().min(1, 'Last name is required').max(100, 'Maximum 100 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(256),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(150, 'Maximum 150 characters'),
  role: z.enum([ROLE.Employee, ROLE.ItAdmin], { errorMap: () => ({ message: 'Select a role' }) }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit'),
});
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.omit({ password: true });
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
