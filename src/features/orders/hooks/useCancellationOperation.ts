import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { orderService } from '../services/orderService';

const cancellationKey = (orderId: string) => ['orders', orderId, 'cancellation'] as const;

export function useCancellationOperation(orderId: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: cancellationKey(orderId),
    queryFn: () => orderService.getCancellation(orderId),
  });

  const reconcile = useMutation({
    mutationFn: (body: { confirmed: boolean; note: string }) =>
      orderService.reconcileCancellation(orderId, body),
    onSuccess: (operation) => {
      queryClient.setQueryData(cancellationKey(orderId), operation);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      if (operation.shipmentId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.detail(operation.shipmentId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.byOrder(orderId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.lists() });
      }
    },
  });

  return { ...query, reconcile };
}
