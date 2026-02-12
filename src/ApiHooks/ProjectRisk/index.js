import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateProjectRisk = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`ProjectRisk/Add`, Data),
  });
};

export const useDeleteProjectRiskById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectRisk/Delete?id=${id}`),
  });
};

export const useEditProjectRisk = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectRisk/Update`, editData),
  });
};

export const useGetProjectRisk = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectRisk-list', id],
    queryFn: async () => await apiClient(`ProjectRisk/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
