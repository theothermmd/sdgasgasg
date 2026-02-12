import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateDocumentType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`DocumentType/Add`, Data),
  });
};

export const useDeleteDocumentTypeById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`DocumentType/Delete?id=${id}`),
  });
};

export const useEditDocumentType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`DocumentType/Update`, editData),
  });
};

export const useGetDocumentType = (enabled) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['DocumentType-list', enabled], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`DocumentType/GetAll`),
    enabled: enabled,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
