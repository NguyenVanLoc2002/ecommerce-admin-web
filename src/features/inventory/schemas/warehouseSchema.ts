import { z } from 'zod';

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`).optional().default('');

const optionalCoordinate = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || !Number.isNaN(Number(value)), `${label} must be a number`)
    .refine((value) => value === '' || (Number(value) >= min && Number(value) <= max), `${label} must be between ${min} and ${max}`)
    .default('');

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(50).regex(/^[A-Za-z0-9_-]+$/, 'Code may only contain letters, digits, _ and -'),
  location: optionalText(255, 'Location'),
  pickupAddress: optionalText(500, 'Pickup address'),
  pickupShortAddress: optionalText(255, 'Pickup short address'),
  pickupContactName: optionalText(200, 'Pickup contact name'),
  pickupContactPhone: optionalText(50, 'Pickup contact phone'),
  pickupLat: optionalCoordinate('Pickup latitude', -90, 90),
  pickupLng: optionalCoordinate('Pickup longitude', -180, 180),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
