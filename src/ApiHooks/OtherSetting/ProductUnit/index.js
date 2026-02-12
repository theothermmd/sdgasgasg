import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProductUnit = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProductUnitData) => await apiClient.post(`/ProductUnit/Add`, ProductUnitData),
  });
};

export const useDeleteProductUnitById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`/ProductUnit/Delete?id=${id}`),
  });
};

export const useEditProductUnit = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/ProductUnit/Update`, editData),
  });
};

export const useGetProductUnit = (enabledProductUnit) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProductUnit-list', enabledProductUnit], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`/ProductUnit/GetAll`),
    enabled: enabledProductUnit,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
