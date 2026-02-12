import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  TabCategorieId: '',
  TabCheckListId: '',
  ProjectCharterId: '',
  FormName: '',
  accrssgroupmode: true,
};

const FormSlice = createSlice({
  name: 'Form',
  initialState,
  reducers: {
    handleAddTabCategorieId: (state, action) => {
      state.TabCategorieId = action.payload;
    },
    handleAddTabCheckListId: (state, action) => {
      state.TabCheckListId = action.payload;
    },
    handleAddProjectCharterId: (state, action) => {
      state.ProjectCharterId = action.payload;
    },
    handleAddFormName: (state, action) => {
      state.FormName = action.payload;
    },
    handleAccrssgroupmode: (state, action) => {
      state.accrssgroupmode = action.payload;
    },
  },
});

export const { handleAddTabCategorieId, handleAddTabCheckListId, handleAddProjectCharterId, handleAddFormName, handleAccrssgroupmode } = FormSlice.actions;

export default FormSlice.reducer;
