import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useDeleteProjectCost = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectCost/Delete?id=${id}`),
  });
};

export const useCreateProjectCost = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (data) => await apiClient.post(`ProjectCost/add`, data),
  });
};
export const useUpdateProjectCost = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectCost/Update`, editData),
  });
};

export const useGetallProjectCost = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectCost-list', id],
    queryFn: async () => await apiClient(`ProjectCost/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
