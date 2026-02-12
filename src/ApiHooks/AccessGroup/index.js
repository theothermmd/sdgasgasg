import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateAccessGroup = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`AccessGroup/Add`, Data),
  });
};

export const useDeleteAccessGroupById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`AccessGroup/Delete?id=${id}`),
  });
};

export const useEditAccessGroup = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`AccessGroup/Update`, editData),
  });
};

export const useGetAllAccessGroup = (enabled) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['AccessGroup-list', enabled],
    queryFn: async () => await apiClient(`AccessGroup/GetAll`),
    enabled: enabled,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

export const useGetAccessGroupById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`AccessGroup/Get?id=${Data}`),
  });
};

export const GetWorkFlowAccess = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`AccessGroup/GetWorkFlowAccess?id=${Data.id}&&entityId=${Data.entityId}`),
  });
};
