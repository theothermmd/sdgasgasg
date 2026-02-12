import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProposedImplementation = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`/SuggestedImplementationMethod/Add`, Data),
  });
};

export const useDeleteProposedImplementationById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`/SuggestedImplementationMethod/Delete?id=${id}`),
  });
};

export const useEditProposedImplementation = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/SuggestedImplementationMethod/Update`, editData),
  });
};

export const useGetProposedImplementation = (enabled) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['SuggestedImplementationMethod-list', enabled], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`/SuggestedImplementationMethod/GetAll`),
    enabled: enabled,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
