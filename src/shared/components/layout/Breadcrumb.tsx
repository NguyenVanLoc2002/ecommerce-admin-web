import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

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

interface Crumb {
  label: string;
  path: string;
  isCurrent: boolean;
}

function buildCrumbs(pathname: string): Crumb[] {
  if (pathname === '/') {
    return [{ label: 'Dashboard', path: '/', isCurrent: true }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: Crumb[] = [{ label: 'Dashboard', path: '/', isCurrent: false }];

  segments.forEach((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const isId = /^\d+$/.test(segment) || segment === ':id';
    const label = isId ? '#' + segment : (SEGMENT_LABELS[segment] ?? segment);
    crumbs.push({ label, path, isCurrent: index === segments.length - 1 });
  });

  return crumbs;
}

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden />
            )}
            {crumb.isCurrent ? (
              <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-sm text-gray-500 hover:text-gray-700 truncate max-w-[180px]"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
