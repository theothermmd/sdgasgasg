import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  GlobalTitle: '',
};

const GlobalSetting = createSlice({
  name: 'GlobalSetting',
  initialState,
  reducers: {
    handleGlobalTitle: (state, action) => {
      state.GlobalTitle = action.payload;
    },
  },
});

export const { handleGlobalTitle } = GlobalSetting.actions;

export default GlobalSetting.reducer;
