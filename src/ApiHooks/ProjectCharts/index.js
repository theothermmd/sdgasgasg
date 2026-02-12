import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useCreateProjectCharter = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`ProjectCharter/Add`, Data),
  });
};

export const useDeleteProjectCharterById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProjectCharter/Delete?id=${id}`),
  });
};

export const useEditProjectCharter = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProjectCharter/Update`, editData),
  });
};

// export const useGetProjectCharter = (enabled) => {
//   const apiClient = useApiClient();
//   return useQuery({
//     queryKey: ["ProjectCharter-list", enabled], // وابسته به مقدار فعال‌سازی
//     queryFn: async () => await apiClient(`ProjectCharter/GetAll`),
//     enabled: enabled,
//     refetchOnWindowFocus: false,
//     retry :3
//   });
// };

export const useGetProjectCharter = () => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectCharter-list'],
    queryFn: async () => await apiClient(`ProjectCharter/GetAll`),
    refetchOnWindowFocus: false,
  });
};

export const useGetprojectCharterId = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectCharter-projectCharterId'],
    queryFn: async () => await apiClient(`ProjectCharter/GetprojectCharterForm?projectCharterId=${id}`),
    refetchOnWindowFocus: false,
  });
};

export const useGetProjectCharterWithsituation = (situationId) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProjectCharter-list-with-situation', situationId], // Include situationId in the key
    queryFn: async () => {
      if (!situationId) return []; // Don't fetch if no situationId
      return await apiClient(`ProjectCharter/GetAllWithSituation?situation=${situationId}`);
    },
    enabled: !!situationId, // Only fetch when situationId exists
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
export const useGetProjectCharterById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`ProjectCharter/GetById?id=${Data}`),
  });
};
