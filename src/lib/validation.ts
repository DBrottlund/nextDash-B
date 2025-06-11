import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  roleId: z.number().int().positive('Role ID must be a positive integer'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  roleId: z.number().int().positive('Role ID must be a positive integer').optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export const userFiltersSchema = z.object({
  role: z.number().int().positive().optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Role validation schemas
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  permissions: z.record(z.array(z.string())),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  permissions: z.record(z.array(z.string())).optional(),
  isActive: z.boolean().optional(),
});

// Settings validation schemas
export const appSettingSchema = z.object({
  keyName: z.string().min(1, 'Setting key is required'),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const updateSettingsSchema = z.record(z.string());

// Menu validation schemas
export const menuItemSchema = z.object({
  name: z.string().min(1, 'Menu item name is required'),
  path: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.number().int().positive().optional(),
  orderIndex: z.number().int().default(0),
  enabled: z.boolean().default(true),
  requiredRoleId: z.number().int().positive().optional(),
});

// Validation helper functions
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Validation failed'] } };
  }
}

export function createValidationError(errors: Record<string, string[]>) {
  const error = new Error('Validation failed');
  (error as any).errors = errors;
  (error as any).statusCode = 400;
  return error;
}