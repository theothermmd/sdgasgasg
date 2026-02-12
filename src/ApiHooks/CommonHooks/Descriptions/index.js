import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateDescription = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`Description/Add`, Data),
  });
};

export const useDeleteDescriptionById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`Description/Delete?id=${id}`),
  });
};

export const useEditDescription = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`Description/Update`, editData),
  });
};

export const useGetDescription = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['Description-list', id],
    queryFn: async () => await apiClient(`Description/GetAll?projectCharterId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
