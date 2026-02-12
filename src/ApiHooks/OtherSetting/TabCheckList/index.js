import { useQuery, useMutation } from '@tanstack/react-query';
import useApiClient from '../../../services/apiClient';

export const useCreateTabCheckList = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProjectTypeData) => await apiClient.post(`TabCheckList/Add`, ProjectTypeData),
  });
};

export const useDeleteTabCheckListById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`TabCheckList/Delete?id=${id}`),
  });
};

export const useEditTabCheckList = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`TabCheckList/Update`, editData),
  });
};

export const useGetTabCheckList = () => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['TabCheckList'],
    queryFn: async () => await apiClient(`TabCheckList/GetAll`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

export const useGetTabCheckListWithId = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: [id],
    queryFn: async () => await apiClient(`TabCheckList/GetAllWithTabCategoriesId?TabCategoriesId=${id}`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

export const useReorderTabCheckList = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (newindex) => await apiClient.post(`TabCheckList/reorder`, newindex),
  });
};

export const useReorderTabFormSubject = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (newindex) => await apiClient.post(`TabFormSubject/reorder`, newindex),
  });
};

export const useReorderTabForm = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (newindex) => await apiClient.post(`TabForm/reorder`, newindex),
  });
};

export const useGetTabCategories = () => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['TabCategories'],
    queryFn: async () => await apiClient(`TabCategories/GetAll`),
    refetchOnWindowFocus: false,
  });
};

export const useGetTabCategoriesById = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['TabCategories-GetById', id],
    queryFn: async () => await apiClient(`TabCategories/GetById?id=${id}`),
    refetchOnWindowFocus: false,
  });
};

export const useCreateTabCategories = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (AddData) => await apiClient.post(`TabCategories/Add`, AddData),
  });
};

export const useUpdateOfficeOnline = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.put(`TabCategories/UpdateOfficeOnline?TabCategoriesId=${Data.TabCategoriesId}&filenameId=${Data.filenameId}`),
  });
};

export const useEditTabCategories = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (UpdateData) => await apiClient.put(`TabCategories/Update`, UpdateData),
  });
};

export const useDeleteTabCategoriesById = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`TabCategories/Delete?tabcategoryid=${id}`),
  });
};

export const useGetAllCategoriesWithChildren = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: [id, 'useGetAllCategoriesWithChildren'],
    queryFn: async () => {
      const res = await apiClient(`TabCheckList/GetAllCategoriesWithChildren?TabCategoriesId=${id}`);
      console.log('inside : ', id);
      return res;
    },
    refetchOnWindowFocus: false,
  });
};
// subjects ==========================================================================

export const useCreateTabSubject = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProjectTypeData) => await apiClient.post(`TabFormSubject/Add`, ProjectTypeData),
  });
};

export const useDeleteTabSubject = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`TabFormSubject/Delete?id=${id}`),
  });
};

export const useEditTabSubject = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`TabFormSubject/Update`, editData),
  });
};

export const useGetTabSubject = (key = 'TabFormSubject') => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: [key],
    queryFn: async () => await apiClient(`TabFormSubject/GetAll`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

// TabForm  ========================================================
export const useCreateTabForm = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProjectTypeData) => await apiClient.post(`TabForm/Add`, ProjectTypeData),
  });
};

export const useDeleteTabForm = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`TabForm/Delete?id=${id}`),
  });
};

export const useEditTabForm = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`TabForm/Update`, editData),
  });
};

export const useGetTabForm = () => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['TabFormSubject'],
    queryFn: async () => await apiClient(`TabForm/GetAll`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

// TableForm ==================================

export const useCreateTableForm = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ProjectTypeData) => await apiClient.post(`TableForm/Add`, ProjectTypeData),
  });
};

export const useCreateTableFormInside = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (TableFormInsideData) => await apiClient.post(`TableForm/AddInside`, TableFormInsideData),
  });
};

export const useEditTableFormInside = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (TableFormInsideData) => await apiClient.put(`TableForm/UpdateInside`, TableFormInsideData),
  });
};
export const useDeleteTableFormInside = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`TableForm/DeleteInside?TableForminsideId=${id}`),
  });
};
export const useGetTableFormInside = (id) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: [id],
    queryFn: async () => await apiClient(`TableForm/GetAllInsideWithTabFormId?TabFormId=${id}`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

export const useDeleteTableForm = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (id) => await apiClient.delete(`TableForm/Delete?TableFormId=${id}`),
  });
};

export const useEditTableForm = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (editData) => await apiClient.put(`TableForm/Update`, editData),
  });
};

export const useGetTableForm = (key = 'TableForm') => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: [key],
    queryFn: async () => await apiClient(`TableForm/GetAll`),
    refetchOnWindowFocus: false,
    retry: 0,
  });
};

// ========================================

export const useAddProjectcharter = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async ({ projectcharterdata, TabCategorieID }) => {
      const response = await apiClient.post(`TabFormValue/addProjectcharter?TabCategoriesId=${TabCategorieID}`, projectcharterdata);
      return response.data;
    },
  });
};

export const useUpdateProjectcharter = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (projectcharterdata) => {
      const response = await apiClient.put(`TabFormValue/UpdateProjectCharter`, projectcharterdata);
      return response.data;
    },
  });
};

export const useGetAllWithprojectcharterId = (ProjectcharterId, TabCheckListId) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['AllWithprojectcharterId'],
    queryFn: async () => await apiClient(`TabFormValue/GetAllWithprojectcharterId?projectcharterId=${ProjectcharterId}&CheckListId=${TabCheckListId}`),
    refetchOnWindowFocus: false,
    enabled: !!ProjectcharterId,
    retry: 0,
    refetchOnMount: true,
  });
};

export const useAddListTableFormInside = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`TableFormInsideValue/AddList`, Data),
  });
};

export const useAddListTabFormValue = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (Data) => await apiClient.post(`TabFormValue/AddList`, Data),
  });
};

export const useGetTabFormValue = (projectcharterId, CheckListId) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: [projectcharterId, CheckListId, 'useGetTabFormValue'],
    queryFn: async () => await apiClient(`TabFormValue/GetAllWithprojectcharterId?projectcharterId=${projectcharterId}&CheckListId=${CheckListId}`),
    refetchOnWindowFocus: false,

    retry: 0,
  });
};

export const useGetTableFormInsideValue = (projectcharterId, CheckListId) => {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: [projectcharterId, CheckListId + '12313', 'useGetTableFormInsideValue'],
    queryFn: async () => await apiClient(`TableFormInsideValue/GetAllInsideWith?TabCheckListId=${CheckListId}&ProjectCharterId=${projectcharterId}`),
    refetchOnWindowFocus: false,

    retry: 0,
  });
};

export const useEditTableFormInsideValue = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (TableFormInsideValue) => {
      const response = await apiClient.put(`TableFormInsideValue/UpdateList`, TableFormInsideValue);
      return response.data;
    },
  });
};

export const useEditTabFormValue = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (TabFormValue) => {
      const response = await apiClient.put(`TabFormValue/UpdateList`, TabFormValue);
      return response.data;
    },
  });
};

export const useReorderTableFormInside = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async (ReorderTableForm) => {
      const response = await apiClient.post(`TableForm/reorder`, ReorderTableForm);
      return response.data;
    },
  });
};
