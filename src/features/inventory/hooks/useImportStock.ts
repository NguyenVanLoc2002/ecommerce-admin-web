import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { AppError } from '@/shared/types/api.types';
import { isConcurrencyErrorCode } from '@/shared/utils/adminPhase3Errors';
import { inventoryService } from '../services/inventoryService';
import type { ImportStockFormValues } from '../schemas/importStockSchema';

export function useImportStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ImportStockFormValues) =>
      inventoryService.adjustStock({ ...values, movementType: 'IMPORT' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
    onError: (error) => {
      if (!(error instanceof AppError) || !isConcurrencyErrorCode(error.code)) {
        return;
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}
