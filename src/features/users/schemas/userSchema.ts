import { z } from 'zod';

const PHONE_REGEX = /^(0|\+84)[3-9][0-9]{8}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

export const ASSIGNABLE_ROLE_VALUES = ['STAFF', 'ADMIN', 'SUPER_ADMIN'] as const;
export const USER_FILTER_ROLE_VALUES = ['STAFF', 'ADMIN', 'SUPER_ADMIN', 'CUSTOMER'] as const;
export const USER_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'LOCKED'] as const;

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    });

const optionalPhoneNumber = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  })
  .refine((value) => !value || PHONE_REGEX.test(value), {
    message: 'Phone number must be in 0xxxxxxxxx or +84xxxxxxxxx format.',
  });

export const createUserSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.')
    .max(255, 'Email must be at most 255 characters.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(64, 'Password must be at most 64 characters.')
    .regex(
      PASSWORD_REGEX,
      'Password must include at least one lowercase letter, one uppercase letter, and one digit.',
    ),
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(100, 'First name must be at most 100 characters.'),
  lastName: optionalTrimmedString(100),
  phoneNumber: optionalPhoneNumber,
  roles: z
    .array(z.enum(ASSIGNABLE_ROLE_VALUES))
    .min(1, 'Select at least one role.'),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(100, 'First name must be at most 100 characters.'),
  lastName: optionalTrimmedString(100),
  phoneNumber: optionalPhoneNumber,
  status: z.enum(USER_STATUS_VALUES, {
    required_error: 'Status is required.',
  }),
  roles: z
    .array(z.enum(ASSIGNABLE_ROLE_VALUES))
    .min(1, 'Select at least one role.'),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
