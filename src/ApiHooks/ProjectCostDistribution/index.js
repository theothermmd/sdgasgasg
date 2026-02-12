import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateProjectCostDistribution = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`ProjectCostDistribution/Add`, Data),
  });
};

export const useDeleteProjectCostDistributionById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectCostDistribution/Delete?id=${id}`),
  });
};

export const useEditProjectCostDistribution = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectCostDistribution/Update`, editData),
  });
};

export const useGetProjectCostDistribution = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectCostDistribution-list', id],
    queryFn: async () => await apiClient(`ProjectCostDistribution/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
