import { ForbiddenState } from '@/shared/components/feedback/ForbiddenState';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <ForbiddenState />
    </div>
  );
}
