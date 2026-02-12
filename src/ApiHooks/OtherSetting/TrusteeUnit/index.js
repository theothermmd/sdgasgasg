import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateTrusteeUnit = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`TrusteeUnit/Add`, Data),
  });
};

export const useDeleteTrusteeUnitByGIUD = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`TrusteeUnit/DeleteWithChildren?id=${id}`),
  });
};

export const useEditTrusteeUnit = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`TrusteeUnit/Update`, editData),
  });
};

export const useGetTrusteeUnit = () => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['TrusteeUnit-list'],
    queryFn: async () => await apiClient(`TrusteeUnit/GetAll`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

export const useGetAllTrusteeUnitWithAccessGroupEffect = (userid, property, mode) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['TrusteeUnitWithTypeWithAccessGroup-list', userid, property, mode],
    queryFn: async () => await apiClient(`TrusteeUnit/GetAllWithAccessGroupEffect?id=${userid}&property=${property}&mode=${mode}`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
