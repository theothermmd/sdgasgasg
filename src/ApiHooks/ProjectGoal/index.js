import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateProjectGoal = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`ProjectGoal/Add`, Data),
  });
};

export const useDeleteProjectGoalById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectGoal/Delete?id=${id}`),
  });
};

export const useEditProjectGoal = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectGoal/Update`, editData),
  });
};

export const useGetProjectGoal = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectGoal-list', id],
    queryFn: async () => await apiClient(`ProjectGoal/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
