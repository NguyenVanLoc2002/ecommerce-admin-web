import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productBadgeService, type ProductBadgeInput } from '../services/productBadgeService';

const key = ['product-badges'] as const;
export const useProductBadges = (page: number) =>
  useQuery({ queryKey: [...key, 'list', page], queryFn: () => productBadgeService.list(page) });
export const useProductBadge = (id: string | undefined) =>
  useQuery({ queryKey: [...key, 'detail', id], queryFn: () => productBadgeService.get(id ?? ''), enabled: Boolean(id) });
export const useSaveProductBadge = (id: string | undefined) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductBadgeInput) => productBadgeService.save(id, input),
    onSuccess: (badge) => {
      client.setQueryData([...key, 'detail', badge.id], badge);
      void client.invalidateQueries({ queryKey: [...key, 'list'] });
    },
  });
};
export const useProductBadgeAssignments = (id: string, page: number) => {
  const client = useQueryClient();
  const products = useQuery({ queryKey: [...key, id, 'products', page], queryFn: () => productBadgeService.products(id, page) });
  const refresh = () => void client.invalidateQueries({ queryKey: [...key, id, 'products'] });
  const assign = useMutation({ mutationFn: (productId: string) => productBadgeService.assign(id, productId), onSuccess: refresh });
  const unassign = useMutation({ mutationFn: (productId: string) => productBadgeService.unassign(id, productId), onSuccess: refresh });
  return { products, assign, unassign };
};
