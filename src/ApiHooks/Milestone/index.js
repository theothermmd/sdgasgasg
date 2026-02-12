import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateMilestone = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`Milestone/Add`, Data),
  });
};

export const useDeleteMilestoneById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`Milestone/Delete?id=${id}`),
  });
};

export const useEditMilestone = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`Milestone/Update`, editData),
  });
};

export const useGetMilestone = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['Milestone-list', id],
    queryFn: async () => await apiClient(`Milestone/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
