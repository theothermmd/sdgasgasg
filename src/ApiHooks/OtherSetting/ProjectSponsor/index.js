import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProjectSponsor = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (CurrencyData) => await apiClient.post(`ProjectSponsor/Add`, CurrencyData),
  });
};

export const useDeleteProjectSponsorById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectSponsor/Delete?id=${id}`),
  });
};

export const useEditProjectSponsor = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectSponsor/Update`, editData),
  });
};

export const useGetProjectSponsor = (enabledCurrency) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectSponsor-list', enabledCurrency], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`ProjectSponsor/GetAll`),
    enabled: enabledCurrency,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
