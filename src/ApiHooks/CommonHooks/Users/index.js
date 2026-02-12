import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useGetUsers = (enabled) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['User-list', enabled], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`User/GetAll`),
    enabled: enabled,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

export const useGetAccessForSaveAndPermissions = (enabled) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['userAccess-list', enabled], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`User/GetUserPermissionsAndSaveAccess`),
    enabled: !!enabled,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
export const useGetUserBufullQualifyName = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async () => await apiClient.post(`User/GetUserPerFullQualifyName`),
  });
};
