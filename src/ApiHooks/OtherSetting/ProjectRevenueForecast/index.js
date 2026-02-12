import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProjectRevenueForecast = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`/IncomeForecastType/Add`, Data),
  });
};

export const useDeleteProjectRevenueForecastById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`/IncomeForecastType/Delete?id=${id}`),
  });
};

export const useEditProjectRevenueForecast = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/IncomeForecastType/Update`, editData),
  });
};

export const useGetProjectRevenueForecast = (enabled) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectRevenueForecast-list', enabled], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`/IncomeForecastType/GetAll`),
    enabled: enabled,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
