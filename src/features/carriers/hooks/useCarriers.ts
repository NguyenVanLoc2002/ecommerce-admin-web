import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/queryKeys';
import { carrierService } from '../services/carrierService';
import type { CarrierListParams } from '../types/carrier.types';

export function useCarriers(params: CarrierListParams) {
  return useQuery({
    queryKey: queryKeys.carriers.list(params),
    queryFn: () => carrierService.getList(params),
    staleTime: 30_000,
  });
}
