import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateConnectionType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`CommunicationType/Add`, Data),
  });
};

export const useDeleteConnectionTypeById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`CommunicationType/Delete?id=${id}`),
  });
};

export const useEditConnectionType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`CommunicationType/Update`, editData),
  });
};

export const useGetConnectionType = (enabled) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['CommunicationType-list', enabled], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`CommunicationType/GetAll`),
    enabled: enabled,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
