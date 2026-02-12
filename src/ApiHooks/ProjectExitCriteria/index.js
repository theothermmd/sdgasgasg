import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useDeleteProjectExitCriteria = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectExitCriteria/Delete?id=${id}`),
  });
};

export const useCreateProjectExitCriteria = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (data) => await apiClient.post(`ProjectExitCriteria/add`, data),
  });
};
export const useUpdateProjectExitCriteria = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectExitCriteria/Update`, editData),
  });
};

export const useGetallProjectExitCriteria = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectExitCriteria-list', id],
    queryFn: async () => await apiClient(`ProjectExitCriteria/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
