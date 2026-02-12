import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateInfluenceScale = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (provinceData) => await apiClient.post(`InfluenceScale/Add`, provinceData),
  });
};

export const useDeleteInfluenceScaleById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`InfluenceScale/Delete?id=${id}`),
  });
};

export const useEditInfluenceScale = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`InfluenceScale/Update`, editData),
  });
};

export const useGetInfluenceScale = (enabledProvince) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['InfluenceScale-list', enabledProvince], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`InfluenceScale/GetAll`),
    enabled: enabledProvince,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
