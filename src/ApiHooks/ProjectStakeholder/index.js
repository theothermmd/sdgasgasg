import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateProjectStakeholder = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`ProjectStakeholder/Add`, Data),
  });
};

export const useDeleteProjectStakeholderById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectStakeholder/Delete?id=${id}`),
  });
};

export const useEditProjectStakeholder = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectStakeholder/Update`, editData),
  });
};

export const useGetProjectStakeholder = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectStakeholder-list', id],
    queryFn: async () => await apiClient(`ProjectStakeholder/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
