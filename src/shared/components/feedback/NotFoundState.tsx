import { FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';

interface NotFoundStateProps {
  title?: string;
  message?: string;
}

export function NotFoundState({
  title = 'Not Found',
  message = "The page or resource you're looking for doesn't exist.",
}: NotFoundStateProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <FileQuestion className="mb-4 h-12 w-12 text-gray-300" aria-hidden />
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">{message}</p>
      <Button variant="secondary" size="sm" className="mt-6" onClick={() => navigate(-1)}>
        Go back
      </Button>
    </div>
  );
}
