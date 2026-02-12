import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateProposalGlobalTitle = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProposalGlobalTitleData) => await apiClient.post(`ProposalGlobalTitle/Add`, ProposalGlobalTitleData),
  });
};

export const useDeleteProposalGlobalTitleById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`ProposalGlobalTitle/Delete?id=${id}`),
  });
};

export const useEditProposalGlobalTitle = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`ProposalGlobalTitle/Update`, editData),
  });
};

export const useGetProposalGlobalTitle = (tokenAuth) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['ProposalGlobalTitle-list', tokenAuth],
    queryFn: async () => await apiClient(`ProposalGlobalTitle/GetAll`),
    enabled: !!tokenAuth,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
