import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProjectExitType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ExitTypeData) => await apiClient.post(`/ExitType/Add`, ExitTypeData),
  });
};

export const useDeleteProjectExitTypeById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`/ExitType/Delete?id=${id}`),
  });
};

export const useEditProjectExitType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/ExitType/Update`, editData),
  });
};

export const useGetProjectExitType = (enabledExitType) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ExitType-list', enabledExitType], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`/ExitType/GetAll`),
    enabled: enabledExitType,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
