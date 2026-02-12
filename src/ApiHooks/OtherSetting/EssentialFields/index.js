import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useGetRequiredFields = () => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['GetRequiredFields-list'],
    queryFn: async () => await apiClient(`RequiredField/GetAll`),
    refetchOnWindowFocus: false,
    retry: false, // جلوگیری از تلاش مجدد در صورت وقوع خطا
  });
};

export const useEditRequiredFields = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (EditRequiredField) => await apiClient.put(`RequiredField/Update`, EditRequiredField),
    onError: (error) => {
      console.error('خطا در ویرایش فیلد ضروری:', error);
    },
  });
};
