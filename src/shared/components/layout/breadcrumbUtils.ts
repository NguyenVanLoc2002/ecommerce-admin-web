const SEGMENT_LABELS: Record<string, string> = {
  '': 'Dashboard',
  products: 'Products',
  new: 'New',
  variants: 'Variants',
  categories: 'Categories',
  brands: 'Brands',
  inventory: 'Inventory',
  warehouses: 'Warehouses',
  stock: 'Stock',
  reservations: 'Reservations',
  orders: 'Orders',
  payments: 'Payments',
  shipments: 'Shipments',
  invoices: 'Invoices',
  promotions: 'Promotions',
  vouchers: 'Vouchers',
  usages: 'Usages',
  reviews: 'Reviews',
  'audit-log': 'Audit Log',
};

export interface Crumb {
  label: string;
  path: string;
  isCurrent: boolean;
}

const UUID_SEGMENT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isOpaqueIdSegment(segment: string) {
  return /^\d+$/.test(segment) || UUID_SEGMENT_PATTERN.test(segment) || segment === ':id';
}

export function buildCrumbs(pathname: string, labels: Record<string, string> = {}): Crumb[] {
  if (pathname === '/') {
    return [{ label: 'Dashboard', path: '/', isCurrent: true }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [{ label: 'Dashboard', path: '/', isCurrent: false }];

  segments.forEach((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const overrideLabel = labels[path];
    const label = overrideLabel
      ?? (isOpaqueIdSegment(segment) ? 'Loading...' : (SEGMENT_LABELS[segment] ?? segment));
    crumbs.push({ label, path, isCurrent: index === segments.length - 1 });
  });

  return crumbs;
}
