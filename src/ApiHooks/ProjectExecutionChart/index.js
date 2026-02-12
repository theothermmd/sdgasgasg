import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateProjectExecutionChart = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`ProjectExecutionChart/Add`, Data),
  });
};

export const useDeleteProjectExecutionChartById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectExecutionChart/Delete?id=${id}`),
  });
};

export const useEditProjectExecutionChart = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectExecutionChart/Update`, editData),
  });
};

export const useGetProjectExecutionChart = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectExecutionChart-list', id],
    queryFn: async () => await apiClient(`ProjectExecutionChart/GetAll?projectcharterId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
