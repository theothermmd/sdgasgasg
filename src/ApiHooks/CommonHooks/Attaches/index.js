import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateAttach = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`Attach/Add`, Data),
  });
};

export const useDeleteAttachById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`Attach/Delete?id=${id}`),
  });
};

export const useEditAttach = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`Attach/Update`, editData),
  });
};

export const useGetAttach = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['Attach-list', id],
    queryFn: async () => await apiClient(`Attach/GetAll?id=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
