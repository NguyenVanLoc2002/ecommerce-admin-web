import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { toast } from '@/shared/stores/uiStore';
import { decideOrderReturn, type OrderReturn, type ReturnDecision } from '../services/orderReturnService';

export function useReturnDecision(entry: OrderReturn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { action: ReturnDecision; reason: string; key: string; deliveredAt?: string }) =>
      decideOrderReturn(entry, request.action, request.reason, request.key, request.deliveredAt),
    onSuccess: (result) => {
      toast.success(`Return status: ${result.status.toLowerCase().replace(/_/g, ' ')}.`);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.returnLists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.returnDetail(entry.id) }),
      ]);
    },
  });
}
