import { z } from 'zod';

export const zodString = z.string().trim();

export const zodRequiredString = (label = 'This field') =>
  z.string().trim().min(1, `${label} is required`);

export const zodSlug = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

export const zodPositiveInt = (label = 'Value') =>
  z
    .number({ required_error: `${label} is required` })
    .int(`${label} must be a whole number`)
    .positive(`${label} must be greater than 0`);

export const zodNonNegativeInt = (label = 'Value') =>
  z
    .number({ required_error: `${label} is required` })
    .int(`${label} must be a whole number`)
    .min(0, `${label} must be 0 or greater`);

export const zodPositiveDecimal = (label = 'Value') =>
  z
    .number({ required_error: `${label} is required` })
    .positive(`${label} must be greater than 0`);

export const zodPercentage = z
  .number({ required_error: 'Percentage is required' })
  .min(0, 'Percentage must be between 0 and 100')
  .max(100, 'Percentage must be between 0 and 100');

export const zodDateString = z
  .string()
  .min(1, 'Date is required')
  .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' });

export const zodOptionalString = z.string().trim().optional().or(z.literal(''));

export const zodOptionalNumber = z.number().optional().nullable();

export { z };
