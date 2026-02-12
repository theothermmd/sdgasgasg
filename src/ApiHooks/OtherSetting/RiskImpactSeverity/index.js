import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateRiskImpactSeverity = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProjectPortfolioData) => await apiClient.post(`RiskImpactSeverity/Add`, ProjectPortfolioData),
  });
};

export const useDeleteRiskImpactSeverityById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`RiskImpactSeverity/Delete?id=${id}`),
  });
};

export const useEditRiskImpactSeverity = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`RiskImpactSeverity/Update`, editData),
  });
};

export const useGetRiskImpactSeverity = (enabledRiskImpactSeverity) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['RiskImpactSeverity-list'], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`RiskImpactSeverity/GetAll`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
