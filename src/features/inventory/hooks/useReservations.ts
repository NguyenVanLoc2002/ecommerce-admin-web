import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { inventoryService } from '../services/inventoryService';
import type { ReservationParams } from '../types/inventory.types';

export function useReservations(params: ReservationParams) {
  return useQuery({
    queryKey: queryKeys.inventory.reservations(params),
    queryFn: () => inventoryService.getReservations(params),
    staleTime: 30_000,
  });
}
