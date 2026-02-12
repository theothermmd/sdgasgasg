import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';
export const useGetProjectCharterHistory = (projectCharterId) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['projectCharterHistory', projectCharterId],
    queryFn: async () => await apiClient(`CharterHistory/GetAll?projectCharterId=${projectCharterId}`),
    refetchOnWindowFocus: false,
  });
};
