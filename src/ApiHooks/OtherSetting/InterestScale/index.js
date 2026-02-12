import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateInterestScale = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (provinceData) => await apiClient.post(`InterestScale/Add`, provinceData),
  });
};

export const useDeleteInterestScaleById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`InterestScale/Delete?id=${id}`),
  });
};

export const useEditInterestScale = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`InterestScale/Update`, editData),
  });
};

export const useGetInterestScale = (enabledProvince) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['InterestScale-list', enabledProvince], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`InterestScale/GetAll`),
    enabled: enabledProvince,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
