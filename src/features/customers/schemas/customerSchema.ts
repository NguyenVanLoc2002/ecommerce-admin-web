import { z } from 'zod';

const PHONE_REGEX = /^(0|\+84)[3-9][0-9]{8}$/;

export const CUSTOMER_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'LOCKED'] as const;
export const CUSTOMER_GENDER_VALUES = ['MALE', 'FEMALE', 'OTHER'] as const;

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

const optionalIsoDate = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  })
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Birth date must be in YYYY-MM-DD format.',
  });

const optionalUrl = z
  .string()
  .max(500, 'Avatar URL must be at most 500 characters.')
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }
    return value.trim();
  });

export const updateCustomerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(100, 'First name must be at most 100 characters.'),
  lastName: optionalTrimmedString(100),
  phoneNumber: optionalPhoneNumber,
  gender: z.enum(CUSTOMER_GENDER_VALUES).optional(),
  birthDate: optionalIsoDate,
  avatarUrl: optionalUrl,
});

export const updateCustomerStatusSchema = z.object({
  status: z.enum(CUSTOMER_STATUS_VALUES, {
    required_error: 'Status is required.',
  }),
});

export type UpdateCustomerFormValues = z.infer<typeof updateCustomerSchema>;
export type UpdateCustomerStatusFormValues = z.infer<typeof updateCustomerStatusSchema>;
