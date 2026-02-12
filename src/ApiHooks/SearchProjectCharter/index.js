import { useQuery } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useSearchProjectCharter = (Title, InsertBy, situation) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: ['SearchProjectCharter', Title, InsertBy, situation],
    queryFn: async () => {
      if (Title && !InsertBy) {
        return await apiClient(`SearchProjectCharter/Search?Title=${Title}&&situation=${situation}`);
      } else if (!Title && InsertBy) {
        return await apiClient(`SearchProjectCharter/Search?InsertBy=${InsertBy}&situation=${situation}`);
      } else if (!Title && !InsertBy) {
        return await apiClient(`SearchProjectCharter/Search?situation=${situation}`);
      } else {
        return await apiClient(`SearchProjectCharter/Search?Title=${Title}&InsertBy=${InsertBy}&situation=${situation}`);
      }
    },
    refetchOnWindowFocus: false,
    enabled: !Title || !InsertBy || !situation,
    retry: 0,
  });
};
