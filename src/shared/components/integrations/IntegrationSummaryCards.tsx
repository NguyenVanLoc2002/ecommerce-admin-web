import { cn } from '@/shared/utils/cn';

export interface IntegrationSummaryCardItem {
  label: string;
  value: string;
  hint: string;
}

interface IntegrationSummaryCardsProps {
  items: IntegrationSummaryCardItem[];
  className?: string;
}

export function IntegrationSummaryCards({
  items,
  className,
}: IntegrationSummaryCardsProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-4', className)}>
      {items.map((item) => (
        <section
          key={item.label}
          className="rounded-xl border border-gray-200 bg-white px-5 py-4"
        >
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            {item.label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-gray-900">{item.value}</p>
          <p className="mt-2 text-sm text-gray-500">{item.hint}</p>
        </section>
      ))}
    </div>
  );
}

