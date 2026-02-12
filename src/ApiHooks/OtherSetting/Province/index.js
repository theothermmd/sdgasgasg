import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProvince = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (provinceData) => await apiClient.post(`Location/Add`, provinceData),
  });
};

export const useDeleteProvinceById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`Location/DeleteWithChildren?id=${id}`),
  });
};

export const useEditProvince = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`Location/Update`, editData),
  });
};

export const useGetProvince = (enabledProvince) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['Location-list', enabledProvince], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`Location/GetAll`),
    enabled: enabledProvince,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
