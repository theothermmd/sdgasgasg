import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../services/apiClient';

export const useSend = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`WfeProjectChart/Send`, Data),
  });
};
export const useAssign = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`WfeProjectChart/Assign`, Data),
  });
};
export const useAcceptableActions = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async () => await apiClient.post(`WfeProjectChart/AcceptableActions`),
  });
};
export const useStageDetails = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`WfeProjectChart/StageDetails?id=${Data}`),
  });
};

export const useApprove = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.put(`WfeProjectChart/Approve?id=${Data}`),
  });
};
export const useReject = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.put(`WfeProjectChart/Reject?id=${Data}`),
  });
};
export const useReturn = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.put(`WfeProjectChart/Return?id=${Data}`),
  });
};

export const useGetWaitForActionAccess = () => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['WfeProjectChart-list'],
    queryFn: async () => await apiClient(`WfeProjectChart/WaitForActionAccess`),
    //enabled: id !== undefined && id !== null,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
