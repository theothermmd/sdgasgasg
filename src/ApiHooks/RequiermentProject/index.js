import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateProjectRequirement = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`ProjectRequirement/Add`, Data),
  });
};

export const useDeleteProjectRequirementById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectRequirement/Delete?id=${id}`),
  });
};

export const useEditProjectRequirement = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectRequirement/Update`, editData),
  });
};

export const useGetProjectRequirement = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectRequirement-list', id],
    queryFn: async () => await apiClient(`ProjectRequirement/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
