import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateRevenueForecast = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`RevenueForecast/Add`, Data),
  });
};

export const useDeleteRevenueForecastById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`RevenueForecast/Delete?id=${id}`),
  });
};

export const useEditRevenueForecast = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`RevenueForecast/Update`, editData),
  });
};

export const useGetRevenueForecast = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['RevenueForecast-list', id],
    queryFn: async () => await apiClient(`RevenueForecast/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
