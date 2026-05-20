import type { ReactNode } from 'react';
import { Badge } from '@/shared/components/ui/Badge';
import { SkeletonForm } from '@/shared/components/feedback';

export function IntegrationCard({
  title,
  description,
  badges,
  children,
}: {
  title: string;
  description: string;
  badges?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
      </div>
      <div className="space-y-6 px-6 py-5">{children}</div>
    </section>
  );
}

export function IntegrationSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function IntegrationNotice({
  variant = 'info',
  children,
}: {
  variant?: 'info' | 'warning';
  children: ReactNode;
}) {
  return (
    <div
      className={[
        'rounded-xl border px-4 py-3 text-sm',
        variant === 'warning'
          ? 'border-warning-200 bg-warning-50 text-warning-900'
          : 'border-info-200 bg-info-50 text-info-900',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export function SecretStatusCard({
  label,
  configured,
}: {
  label: string;
  configured: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="mt-1 text-xs text-gray-500">Actual values are never shown in the admin UI.</p>
        </div>
        <Badge variant={configured ? 'success' : 'default'}>
          {configured ? 'Configured' : 'Not configured'}
        </Badge>
      </div>
    </div>
  );
}

export function ProviderStateBadges({
  enabled,
  managedInDatabase,
}: {
  enabled: boolean;
  managedInDatabase: boolean;
}) {
  return (
    <>
      <Badge variant={enabled ? 'success' : 'default'}>{enabled ? 'Enabled' : 'Disabled'}</Badge>
      <Badge variant={managedInDatabase ? 'primary' : 'warning'}>
        {managedInDatabase ? 'DB managed' : 'Env fallback'}
      </Badge>
    </>
  );
}

export function IntegrationCardSkeleton() {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="px-6 py-5">
        <SkeletonForm fields={8} />
      </div>
    </section>
  );
}
