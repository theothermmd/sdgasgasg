import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateCurrency = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (CurrencyData) => await apiClient.post(`Currency/Add`, CurrencyData),
  });
};

export const useDeleteCurrencyById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`Currency/Delete?id=${id}`),
  });
};

export const useEditCurrency = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`Currency/Update`, editData),
  });
};

export const useGetCurrency = (enabledCurrency) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['Currency-list', enabledCurrency], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`Currency/GetAll`),
    enabled: enabledCurrency,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
