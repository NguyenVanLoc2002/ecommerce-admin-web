import { describe, expect, it } from 'vitest';
import { warehouseSchema } from '../schemas/warehouseSchema';

describe('warehouseSchema', () => {
  const baseWarehouse = {
    name: 'Main warehouse',
    code: 'MAIN-01',
    location: '',
    pickupAddress: ' 123 Nguyen Hue ',
    pickupShortAddress: ' District 1 ',
    pickupContactName: ' Warehouse team ',
    pickupContactPhone: ' 0900000000 ',
    pickupLat: '10.77689',
    pickupLng: '106.70081',
    status: 'ACTIVE' as const,
  };

  it('accepts and trims a warehouse pickup profile', () => {
    expect(warehouseSchema.parse(baseWarehouse)).toMatchObject({
      pickupAddress: '123 Nguyen Hue',
      pickupShortAddress: 'District 1',
      pickupContactName: 'Warehouse team',
      pickupContactPhone: '0900000000',
      pickupLat: '10.77689',
      pickupLng: '106.70081',
    });
  });

  it('rejects pickup coordinates outside the backend ranges', () => {
    expect(warehouseSchema.safeParse({ ...baseWarehouse, pickupLat: '90.1' }).success).toBe(false);
    expect(warehouseSchema.safeParse({ ...baseWarehouse, pickupLng: '-180.1' }).success).toBe(false);
  });
});
