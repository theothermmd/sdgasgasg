import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  statusModal: false,
  id: null,
  entityType: false,
};

const ModalSlice = createSlice({
  name: 'Modal',
  initialState,
  reducers: {
    handleShowModal: (state, action) => {
      state.statusModal = action.payload;
    },
    handleAddId: (state, action) => {
      state.id = action.payload;
    },
    handleEntityType: (state, action) => {
      state.entityType = action.payload;
    },
  },
});

export const { handleShowModal, handleAddId, handleEntityType } = ModalSlice.actions;

export default ModalSlice.reducer;
