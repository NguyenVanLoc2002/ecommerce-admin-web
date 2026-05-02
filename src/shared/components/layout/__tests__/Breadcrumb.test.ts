import { describe, expect, it } from 'vitest';
import { buildCrumbs } from '../breadcrumbUtils';

describe('buildCrumbs', () => {
  it('hides unresolved route ids until a human-readable label is available', () => {
    const crumbs = buildCrumbs('/products/011396e7-600c-5952-90ed-123456789abc');

    expect(crumbs.map((crumb) => crumb.label)).toEqual(['Dashboard', 'Products', 'Loading...']);
  });

  it('uses dynamic labels for loaded entity breadcrumbs', () => {
    const crumbs = buildCrumbs('/products/011396e7-600c-5952-90ed-123456789abc', {
      '/products/011396e7-600c-5952-90ed-123456789abc': 'Routine Running Shorts 116',
    });

    expect(crumbs.map((crumb) => crumb.label)).toEqual([
      'Dashboard',
      'Products',
      'Routine Running Shorts 116',
    ]);
  });

  it('supports nested detail paths without exposing the parent entity id', () => {
    const crumbs = buildCrumbs('/vouchers/011396e7-600c-5952-90ed-123456789abc/usages', {
      '/vouchers/011396e7-600c-5952-90ed-123456789abc': 'SPRING20',
    });

    expect(crumbs.map((crumb) => crumb.label)).toEqual([
      'Dashboard',
      'Vouchers',
      'SPRING20',
      'Usages',
    ]);
  });
});
