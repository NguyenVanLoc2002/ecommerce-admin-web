import { useContext, useEffect } from 'react';
import { BreadcrumbContext } from './breadcrumbContext';

export function useBreadcrumbLabel(path: string | undefined, label: string | undefined) {
  const context = useContext(BreadcrumbContext);
  const setLabel = context?.setLabel;
  const clearLabel = context?.clearLabel;

  useEffect(() => {
    if (!setLabel || !clearLabel) {
      return undefined;
    }

    const normalizedPath = path?.trim();
    const normalizedLabel = label?.trim();

    if (!normalizedPath || !normalizedLabel) {
      return undefined;
    }

    setLabel(normalizedPath, normalizedLabel);

    return () => {
      clearLabel(normalizedPath);
    };
  }, [clearLabel, label, path, setLabel]);
}

export function useBreadcrumbLabels() {
  const context = useContext(BreadcrumbContext);
  return context?.labels ?? {};
}
