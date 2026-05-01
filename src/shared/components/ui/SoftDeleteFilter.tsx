import { Select } from './Select';
import { SoftDeleteState, type SoftDeleteState as SoftDeleteStateValue } from '@/shared/types/api.types';

const SOFT_DELETE_OPTIONS = [
  { value: SoftDeleteState.ACTIVE, label: 'Active' },
  { value: SoftDeleteState.DELETED, label: 'Deleted' },
  { value: SoftDeleteState.ALL, label: 'All' },
];

interface SoftDeleteFilterProps {
  value?: SoftDeleteStateValue;
  onChange: (value: SoftDeleteStateValue) => void;
  className?: string;
}

export function SoftDeleteFilter({
  value = SoftDeleteState.ACTIVE,
  onChange,
  className,
}: SoftDeleteFilterProps) {
  return (
    <Select
      options={SOFT_DELETE_OPTIONS}
      value={value}
      onChange={(event) => onChange(event.target.value as SoftDeleteStateValue)}
      className={className}
    />
  );
}
