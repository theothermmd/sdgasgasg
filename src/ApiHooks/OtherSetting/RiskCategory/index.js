import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateRiskCategory = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProjectPortfolioData) => await apiClient.post(`RiskCategory/Add`, ProjectPortfolioData),
  });
};

export const useDeleteRiskCategoryById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`RiskCategory/DeleteWithChildren?id=${id}`),
  });
};

export const useEditRiskCategory = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`RiskCategory/Update`, editData),
  });
};

export const useGetRiskCategory = (enabledRiskCategory) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['RiskCategory-list'], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`RiskCategory/GetAll`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
