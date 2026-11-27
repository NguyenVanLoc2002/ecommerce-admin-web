import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sizeGuideService, type AssignmentInput, type GuideInput } from '../services/sizeGuideService';

const key = ['size-guides'] as const;

export const useSizeGuides = (search: string, page: number) =>
  useQuery({ queryKey: [...key, 'list', search, page], queryFn: () => sizeGuideService.list(search, page) });

export const useSizeGuide = (id: string | undefined) =>
  useQuery({ queryKey: [...key, 'detail', id], queryFn: () => sizeGuideService.get(id ?? ''), enabled: Boolean(id) });

export const useSaveSizeGuide = (id: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GuideInput) => sizeGuideService.save(id, input),
    onSuccess: (guide) => {
      queryClient.setQueryData([...key, 'detail', guide.id], guide);
      void queryClient.invalidateQueries({ queryKey: [...key, 'list'] });
    },
  });
};

export const useCopySizeGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sizeGuideService.copy,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...key, 'list'] }),
  });
};

export const useSizeGuideAssignments = (id: string) => {
  const client = useQueryClient();
  const assignments = useQuery({
    queryKey: [...key, 'assignments', id],
    queryFn: () => sizeGuideService.assignments(id),
  });
  const refresh = () => void client.invalidateQueries({ queryKey: [...key, 'assignments'] });
  const assign = useMutation({ mutationFn: (input: AssignmentInput) => sizeGuideService.assign(id, input), onSuccess: refresh });
  const unassign = useMutation({ mutationFn: (assignmentKey: string) => sizeGuideService.unassign(id, assignmentKey), onSuccess: refresh });
  return { assignments, assign, unassign };
};
