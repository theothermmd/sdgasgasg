import { useQuery } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useGetTrustee = (enabled) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['Trustee-list', enabled], // وابسته به مقدار فعال‌سازی
    queryFn: async () => await apiClient(`TrusteeUnit/GetAll`),
    enabled: enabled,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
