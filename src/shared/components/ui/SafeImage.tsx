import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  iconClassName?: string;
}

export function SafeImage({ src, alt, className, iconClassName = 'h-5 w-5' }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div role="img" aria-label={alt ? `${alt} image unavailable` : 'Image unavailable'} className={cn('flex items-center justify-center bg-gray-100 text-gray-400', className)}>
        <ImageOff className={iconClassName} aria-hidden />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
