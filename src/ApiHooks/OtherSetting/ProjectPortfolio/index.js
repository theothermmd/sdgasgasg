import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProjectPortfolio = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProjectPortfolioData) => await apiClient.post(`ProjectPortfolio/Add`, ProjectPortfolioData),
  });
};

export const useDeleteProjectPortfolioById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectPortfolio/DeleteWithChildren?id=${id}`),
  });
};

export const useEditProjectPortfolio = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/ProjectPortfolio/Update`, editData),
  });
};

export const useGetProjectPortfolio = (enabledProjectPortfolio) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectPortfolio-list'], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`ProjectPortfolio/GetAll`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

export const useGetAllProjectPortfolioWithAccessGroupEffect = (userid, property, mode) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectPortfolioWithTypeWithAccessGroup-list', userid, property, mode],
    queryFn: async () => await apiClient(`ProjectPortfolio/GetAllWithAccessGroupEffect?id=${userid}&property=${property}&mode=${mode}`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
