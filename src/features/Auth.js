import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: false,

  api: 'https://prpapi.sazmanyar.org/api/proposal/',
  // api: 'http://prpapi.sazmanyar.org:90/api/proposal/',
  userInformation: false,
  countTask: false,
  TokenValidityInMinute: false,
  OtherTokenValues: null,
  PRPURL: null,
  PRPLibraryName: null,
  PRPCompanyName: null,
  permissionsections: null,
};

const AuthSlice = createSlice({
  name: 'Auth',
  initialState,
  reducers: {
    handleAddToken: (state, action) => {
      state.token = action.payload;
    },
    handlepermissionsections: (state, action) => {
      state.permissionsections = action.payload;
    },
    handleApi: (state, action) => {
      state.api = action.payload;
    },
    handleUserInformation: (state, action) => {
      state.userInformation = action.payload;
    },
    handleOtherTokenValues: (state, action) => {
      state.OtherTokenValues = action.payload;
    },

    handlePRPURL: (state, action) => {
      state.PRPURL = action.payload;
    },
    handleOPRPLibraryName: (state, action) => {
      state.PRPLibraryName = action.payload;
    },
    handlePRPCompanyName: (state, action) => {
      state.PRPCompanyName = action.payload;
    },
  },
});

export const {
  handleAddToken,
  handleApi,
  handleuserid,
  handlepermissionsections,
  handleUserInformation,
  handleOtherTokenValues,
  handlePRPURL,
  handleOPRPLibraryName,
  handlePRPCompanyName,
} = AuthSlice.actions;

export default AuthSlice.reducer;
