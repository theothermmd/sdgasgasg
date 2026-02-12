import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProjectGoalUnit = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProjectGoalUnitData) => await apiClient.post(`ProjectObjectiveUnit/Add`, ProjectGoalUnitData),
  });
};

export const useDeleteProjectGoalUnitById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectObjectiveUnit/Delete?id=${id}`),
  });
};

export const useEditProjectGoalUnit = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectObjectiveUnit/Update`, editData),
  });
};

export const useGetProjectGoalUnit = (enabledProjectGoalUnit) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectGoalUnit-list', enabledProjectGoalUnit], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`ProjectObjectiveUnit/GetAll`),
    enabled: enabledProjectGoalUnit,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
