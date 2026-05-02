import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useBreadcrumbLabels } from './useBreadcrumbLabel';
import { buildCrumbs } from './breadcrumbUtils';

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const { pathname } = useLocation();
  const labels = useBreadcrumbLabels();
  const crumbs = buildCrumbs(pathname, labels);

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
