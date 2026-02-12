import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  flowAccess: {},
  stageDetail: [],
};

const WorkFlowSlice = createSlice({
  name: 'WorkFlow',
  initialState,
  reducers: {
    handleAddFlowAccess: (state, action) => {
      state.flowAccess = action.payload;
    },
    handleAddStageDetail: (state, action) => {
      state.stageDetail = action.payload;
    },
    handleResetFlowAccess: (state, action) => {
      state.flowAccess = {};
    },
  },
});

export const { handleAddStageDetail, handleAddFlowAccess, handleResetFlowAccess } = WorkFlowSlice.actions;

export default WorkFlowSlice.reducer;
