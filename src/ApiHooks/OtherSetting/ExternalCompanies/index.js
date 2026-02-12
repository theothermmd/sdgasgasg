import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateExternalCompanies = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ExternalCompaniesData) => await apiClient.post(`ExternalCompany/Add`, ExternalCompaniesData),
  });
};

export const useDeleteExternalCompaniesById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ExternalCompany/Delete?id=${id}`),
  });
};

export const useEditExternalCompanies = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/ExternalCompany/Update`, editData),
  });
};

export const useGetExternalCompanies = (enabledExternalCompanies) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ExternalCompanies-list', enabledExternalCompanies], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`ExternalCompany/GetAll`),
    enabled: enabledExternalCompanies,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
