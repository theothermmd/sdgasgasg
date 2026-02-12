import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProjectType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProjectTypeData) => await apiClient.post(`ProjectType/Add`, ProjectTypeData),
  });
};

export const useDeleteProjectTypeById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectType/Delete?id=${id}`),
  });
};

export const useEditProjectType = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/ProjectType/Update`, editData),
  });
};

export const useGetProjectType = (enabledProjectType) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectType-list', enabledProjectType], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`ProjectType/GetAll`),
    enabled: enabledProjectType,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

export const useGetAllProjectTypeWithAccessGroupEffect = (userid, property, mode) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectTypeWithTypeWithAccessGroup-list', userid, property, mode],
    queryFn: async () => await apiClient(`ProjectType/GetAllWithAccessGroupEffect?id=${userid}&property=${property}&mode=${mode}`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
