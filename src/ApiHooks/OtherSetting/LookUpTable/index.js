import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateLookUpTable = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProductUnitData) => await apiClient.post(`/LookUpTable/Add`, ProductUnitData),
  });
};

export const useDeleteLookUpTableById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`/LookUpTable/Delete?lookUpTableId=${id}`),
  });
};

export const useEditLookUpTable = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/LookUpTable/Update`, editData),
  });
};

export const useGetLookUpTable = () => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['LookUpTable-list'],
    queryFn: async () => await apiClient(`/LookUpTable/GetAll`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

export const useGetAllLookUpTableInside = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: [id],
    queryFn: async () => await apiClient(`/LookUpTable/GetAllInside?lookUpTableId=${id}`),
    refetchOnWindowFocus: false,
    enabled: !!id,
    retry: 0,
  });
};

export const useCreateLookUpTableInside = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`/LookUpTable/AddInside`, Data),
  });
};

export const useDeleteLookUpTableInside = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`/LookUpTable/DeleteInside?lookUpTableinside=${id}`),
  });
};

export const useEditLookUpTableInside = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`/LookUpTable/UpdateInside`, editData),
  });
};
