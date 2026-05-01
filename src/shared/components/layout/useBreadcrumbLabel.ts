import { useContext, useEffect } from 'react';
import { BreadcrumbContext } from './breadcrumbContext';

export function useBreadcrumbLabel(path: string | undefined, label: string | undefined) {
  const context = useContext(BreadcrumbContext);

  useEffect(() => {
    if (!context) {
      return undefined;
    }

    const normalizedPath = path?.trim();
    const normalizedLabel = label?.trim();

    if (!normalizedPath || !normalizedLabel) {
      return undefined;
    }

    context.setLabel(normalizedPath, normalizedLabel);

    return () => {
      context.clearLabel(normalizedPath);
    };
  }, [context, label, path]);
}

export function useBreadcrumbLabels() {
  const context = useContext(BreadcrumbContext);
  return context?.labels ?? {};
}
