import { useCallback, useMemo, useState } from 'react';
import { BreadcrumbContext, type BreadcrumbLabelMap } from './breadcrumbContext';

interface BreadcrumbProviderProps {
  children: React.ReactNode;
}

export function BreadcrumbProvider({ children }: BreadcrumbProviderProps) {
  const [labels, setLabels] = useState<BreadcrumbLabelMap>({});

  const setLabel = useCallback((path: string, label: string) => {
    setLabels((current) => {
      if (current[path] === label) {
        return current;
      }

      return { ...current, [path]: label };
    });
  }, []);

  const clearLabel = useCallback((path: string) => {
    setLabels((current) => {
      if (!(path in current)) {
        return current;
      }

      const next = { ...current };
      delete next[path];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      labels,
      setLabel,
      clearLabel,
    }),
    [clearLabel, labels, setLabel],
  );

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}
