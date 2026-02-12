import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'leftSidebar',
  initialState: {
    showLeftSidebar: false,
    summeryData: null,
    refechGridData: false,
  },
  reducers: {
    setShowLeftSidebar: (state, action) => {
      state.showLeftSidebar = action.payload;
    },
    setSummeryData: (state, action) => {
      state.summeryData = action.payload;
    },
    handleRefechGridData: (state, action) => {
      state.refechGridData = action.payload;
    },
  },
});

export const { setShowLeftSidebar, setSummeryData, handleRefechGridData } = uiSlice.actions;
export default uiSlice.reducer;
