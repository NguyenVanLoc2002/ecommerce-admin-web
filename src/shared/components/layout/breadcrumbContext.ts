import { createContext } from 'react';

export type BreadcrumbLabelMap = Record<string, string>;

export interface BreadcrumbContextValue {
  labels: BreadcrumbLabelMap;
  setLabel: (path: string, label: string) => void;
  clearLabel: (path: string) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);
