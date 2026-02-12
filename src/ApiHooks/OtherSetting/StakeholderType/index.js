import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateStakeholderType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (StakeholderTypeData) => await apiClient.post(`StakeholderType/Add`, StakeholderTypeData),
  });
};

export const useDeleteStakeholderTypeById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`StakeholderType/Delete?id=${id}`),
  });
};

export const useEditStakeholderType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/StakeholderType/Update`, editData),
  });
};

export const useGetStakeholderType = (enabledStakeholderType) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['StakeholderType-list', enabledStakeholderType], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`StakeholderType/GetAll`),
    enabled: enabledStakeholderType,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
