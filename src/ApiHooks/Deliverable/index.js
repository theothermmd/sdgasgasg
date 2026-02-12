import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateDeliverable = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`Deliverable/Add`, Data),
  });
};

export const useDeleteDeliverableById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`Deliverable/Delete?id=${id}`),
  });
};

export const useEditDeliverable = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`Deliverable/Update`, editData),
  });
};

export const useGetDeliverable = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['Deliverable-list', id],
    queryFn: async () => await apiClient(`Deliverable/GetAll?ProjectchartertId=${id}`),
    enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
