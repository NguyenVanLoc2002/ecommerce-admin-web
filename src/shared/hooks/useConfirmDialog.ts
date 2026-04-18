import { useContext } from 'react';
import {
  ConfirmDialogContext,
  type ConfirmDialogContextValue,
} from '@/shared/components/ui/confirmDialogContext';

export function useConfirmDialog(): ConfirmDialogContextValue {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error('useConfirmDialog must be used inside ConfirmDialogProvider');
  return ctx;
}
