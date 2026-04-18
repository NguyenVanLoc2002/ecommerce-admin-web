import { ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';

export function ForbiddenState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <ShieldOff className="mb-4 h-12 w-12 text-gray-300" aria-hidden />
      <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        You don't have permission to view this page.
      </p>
      <Button variant="secondary" size="sm" className="mt-6" onClick={() => navigate(-1)}>
        Go back
      </Button>
    </div>
  );
}
