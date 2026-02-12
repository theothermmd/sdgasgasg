import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateProjectSchedule = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`ProjectSchedule/Add`, Data),
  });
};

export const useDeleteProjectScheduleById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectSchedule/Delete?id=${id}`),
  });
};

export const useEditProjectSchedule = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectSchedule/Update`, editData),
  });
};

export const useGetProjectSchedule = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectSchedule-list', id],
    queryFn: async () => await apiClient(`ProjectSchedule/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
