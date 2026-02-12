import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateLocationType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`/LocationType/Add`, Data),
  });
};

export const useDeleteLocationTypeById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`/LocationType/Delete?id=${id}`),
  });
};

export const useEditLocationType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/LocationType/Update`, editData),
  });
};

export const useGetLocationType = (enabled) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['LocationType-list', enabled], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`/LocationType/GetAll`),
    enabled: enabled,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
